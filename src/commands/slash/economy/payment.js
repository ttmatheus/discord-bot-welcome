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
      slashCommandData: new SlashCommandBuilder()
        .setName("pagar")
        .setDescription("Envie um pagamento para outro usuário.")
        .setNameLocalizations({ "pt-BR": "pagar", "en-US": "pay" })
        .setDescriptionLocalizations({
          "pt-BR": "Envie um pagamento para outro usuário.",
          "en-US": "Send a payment to another user.",
        })
        .setContexts(["Guild"])
        .addUserOption((option) =>
          option
            .setName("usuário")
            .setDescription("Usuário que recebe o pagamento.")
            .setNameLocalizations({ "pt-BR": "usuário", "en-US": "user" })
            .setDescriptionLocalizations({
              "pt-BR": "Usuário que recebe o pagamento.",
              "en-US": "User receiving payment.",
            })
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("valor")
            .setDescription("O valor que você deseja apostar.")
            .setNameLocalizations({ "pt-BR": "valor", "en-US": "amount" })
            .setDescriptionLocalizations({
              "pt-BR": "Valor do pagamento.",
              "en-US": "Payment amount value.",
            })
            .setAutocomplete(true)
            .setRequired(true),
        ),
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

  async execute(interaction) {
    const creditor = interaction.options.getUser("usuário");
    const economy = this.client.economy;

    if (!creditor || creditor.bot || creditor.id === interaction.user.id)
      return interaction.reply({
        content: `❌ ${interaction.user}, você precisa especificar um usuário válido para enviar um pagamento...`,
        flags: MessageFlags.Ephemeral,
      });

    let authorData = await this.client.database.getOrUpdateUser(
      interaction.user.id,
    );
    const amount = this.client.utils.formatNumber(
      interaction.options.getString("valor"),
    );

    if (
      typeof amount !== "number" ||
      amount < economy.limiters.payment.min ||
      amount > economy.limiters.payment.max
    )
      return interaction.reply({
        content: `❌ ${
          interaction.user
        }, você precisa especificar um valor válido para enviar o pagamento \`(entre ${this.client.utils.formatNumberToLocale(
          economy.limiters.payment.min,
        )} e ${this.client.utils.formatNumberToLocale(
          economy.limiters.payment.max,
        )})\`...`,
        flags: MessageFlags.Ephemeral,
      });

    if (amount > authorData.userBalance)
      return interaction.reply({
        content: `❌ ${interaction.user}, você não tem saldo suficiente para completar esse pagamento...`,
        flags: MessageFlags.Ephemeral,
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
    const msg = await interaction.reply({
      content: `${creditor}, o usuário ${
        interaction.user
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
      if (![interaction.user.id, creditor.id].includes(int.user.id)) return;

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
            interaction.user.id,
          );

          if (amount > authorData.userBalance) return;

          await this.client.database.updateUserBalance(creditor.id, amount);
          await this.client.database.updateUserBalance(
            interaction.user.id,
            -amount,
          );
          await this.client.database.createTransaction({
            source: 5,
            givenBy: interaction.user.id,
            receivedBy: creditor.id,
            givenByUsername: interaction.user.username,
            receivedByUsername: creditor.username,
            givenAt: Date.now(),
            transactionAmount: amount,
          });

          return int.followUp({
            content: `${creditor}, você recebeu um **pagamento** enviado por ${
              interaction.user
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
        int.user.id === interaction.user.id
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
          content: `⏳ ${interaction.user} e ${creditor}, o tempo para aceitar o pagamento esgotou!`,
          components: [],
        });
      }
    });
  }
}
