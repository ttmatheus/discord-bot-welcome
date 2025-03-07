import { CommandBase } from "../../../structures/commands.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      commandName: "pagar",
      commandAliases: ["pay", "payment"],
      commandDescription: "Envie um pagamento para outro usuário.",
      commandUsage: [
        {
          name: "usuário",
          type: "string",
          required: true,
        },
        {
          name: "valor",
          type: "number",
          required: true,
        },
      ],
      commandCategory: "economy",
      commandCooldown: 2,
    });
  }

  async execute(message, args) {
    const creditor = await this.client.clientUtils.findUser(
      args[0],
      message,
      false,
    );
    const economy = this.client.economy;

    if (!creditor || creditor.bot || creditor.id === message.author.id)
      return message.reply({
        content: `❌ ${message.author}, você precisa especificar um usuário válido para enviar um pagamento...`,
      });

    let authorData = await this.client.database.getOrUpdateUser(
      message.author.id,
    );
    const amount = this.client.utils.formatNumber(
      args[1],
      authorData.userBalance,
    );

    if (
      typeof amount !== "number" ||
      amount < economy.limiters.payment.min ||
      amount > economy.limiters.payment.max
    )
      return message.reply({
        content: `❌ ${
          message.author
        }, você precisa especificar um valor válido para enviar o pagamento \`(entre ${this.client.utils.formatNumberToLocale(
          economy.limiters.payment.min,
        )} e ${this.client.utils.formatNumberToLocale(
          economy.limiters.payment.max,
        )})\`...`,
      });

    if (amount > authorData.userBalance)
      return message.reply({
        content: `❌ ${message.author}, você não tem saldo suficiente para completar esse pagamento...`,
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setDisabled(false)
        .setCustomId("accept")
        .setLabel(`Aceitar [0/2]`)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("✅"),
      new ButtonBuilder()
        .setDisabled(false)
        .setCustomId("cancel")
        .setLabel(`Cancelar`)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("❌"),
    );

    let finished = false;
    const accepted = [];
    const msg = await message.reply({
      content: `${creditor}, o usuário ${
        message.author
      }, deseja lhe enviar um **pagamento** no valor de ${
        this.client.economy.emojis.money
      } **${this.client.utils.formatNumberToLocale(amount)} ${
        this.client.economy.names.money
      }**, para aceitar, ambos devem clicar no botão abaixo! (expira <t:${
        Math.floor(Date.now() / 1000) + 300
      }:R>)\n-# Não nos responsabilizamos por nenhum ato de tercerios que envolvam ${
        this.client.economy.names.money
      }, então cuidado com os usuários para quem você envia pagamentos.`,
      components: [row],
    });

    const collector = msg.createMessageComponentCollector({
      time: 300_000,
    });

    collector.on("collect", async (int) => {
      await int.deferUpdate();
      if (![message.author.id, creditor.id].includes(int.user.id)) return;

      if (int.customId === "accept") {
        if (finished) return;

        if (!accepted.includes(int.user.id)) {
          accepted.push(int.user.id);

          let buttons = int.message.components[0];

          buttons.components[0].data.label = `Aceitar [${accepted.length}/2]`;
          if (accepted.length === 2) buttons.components[0].data.disabled = true;
          if (accepted.length === 2)
            buttons.components[1].data.label = "Cancelar";
          if (accepted.length === 2) buttons.components[1].data.disabled = true;

          await int.message.edit({
            components: [buttons],
          });
        }

        if (accepted.length === 2) {
          finished = true;

          authorData = await this.client.database.getOrUpdateUser(
            message.author.id,
          );

          if (amount > authorData.userBalance) return;

          await this.client.database.updateUserBalance(creditor.id, amount);
          await this.client.database.updateUserBalance(
            message.author.id,
            -amount,
          );
          await this.client.database.createTransaction({
            source: 5,
            givenBy: message.author.id,
            receivedBy: creditor.id,
            givenByUsername: message.author.username,
            receivedByUsername: creditor.username,
            givenAt: Date.now(),
            transactionAmount: amount,
          });

          return int.followUp({
            content: `${creditor}, você recebeu um **pagamento** enviado por ${
              message.author
            }, no valor de ${
              this.client.economy.emojis.money
            } **${this.client.utils.formatNumberToLocale(amount)} ${
              this.client.economy.names.money
            }**.`,
          });
        }

        return;
      } else if (
        int.customId === "cancel" &&
        int.user.id === message.author.id
      ) {
        if (finished) return;
        finished = true;

        let buttons = int.message.components[0];

        buttons.components[0].data.label = "Aceitar [0/0]";
        buttons.components[0].data.disabled = true;
        buttons.components[1].data.label = "Cancelado";
        buttons.components[1].data.disabled = true;
        buttons.components[1].data.style = ButtonStyle.Danger;

        await int.message.edit({
          content: `❌ ${int.user} e ${creditor}, esse pagamento foi cancelada.`,
          components: [buttons],
        });

        return;
      }
    });

    collector.on("end", (collected, reason) => {
      if (reason === "time" && !finished) {
        msg.edit({
          content: `⏳ ${message.author} e ${creditor}, o tempo para aceitar o pagamento esgotou!`,
          components: [],
        });
      }
    });
  }
}
