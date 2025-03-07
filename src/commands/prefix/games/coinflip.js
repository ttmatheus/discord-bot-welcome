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
      commandName: "apostar",
      commandAliases: ["bet", "coinflip"],
      commandDescription:
        "Aposte com outro usuário em um jogo de cara ou coroa.",
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
      commandCategory: "games",
      commandCooldown: 2,
    });
  }

  async execute(message, args) {
    const opponent = await this.client.clientUtils.findUser(
      args[0],
      message,
      false,
    );
    const economy = this.client.economy;

    if (!opponent || opponent.bot || opponent.id === message.author.id)
      return message.reply({
        content: `❌ ${message.author}, você precisa especificar um usuário válido para apostar...`,
      });

    let authorData = await this.client.database.getOrUpdateUser(
      message.author.id,
    );
    let opponentData = await this.client.database.getOrUpdateUser(opponent.id);
    const amount = this.client.utils.formatNumber(
      args[1],
      authorData.userBalance,
      opponentData.userBalance,
    );

    if (
      typeof amount !== "number" ||
      amount < economy.limiters.coinflip.min ||
      amount > economy.limiters.coinflip.max
    )
      return message.reply({
        content: `❌ ${
          message.author
        }, você precisa especificar um valor válido para essa aposta \`(entre ${this.client.utils.formatNumberToLocale(
          economy.limiters.coinflip.min,
        )} e ${this.client.utils.formatNumberToLocale(
          economy.limiters.coinflip.max,
        )})\`...`,
      });

    if (amount > authorData.userBalance || amount > opponentData.userBalance)
      return message.reply({
        content: `❌ ${message.author}, algum dos usuários não tem saldo suficiente para completar a aposta...`,
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
      content: `${opponent}, o usuário ${
        message.author
      }, te chamou para jogar um **cara-ou-coroa** apostado no valor de ${
        this.client.economy.emojis.money
      } **${this.client.utils.formatNumberToLocale(amount)} ${
        this.client.economy.names.money
      }**, para aceitar, ambos devem clicar no botão abaixo! (expira <t:${
        Math.floor(Date.now() / 1000) + 300
      }:R>)`,
      components: [row],
    });

    const collector = msg.createMessageComponentCollector({
      time: 300_000,
    });

    collector.on("collect", async (int) => {
      await int.deferUpdate();
      if (![message.author.id, opponent.id].includes(int.user.id)) return;

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
          opponentData = await this.client.database.getOrUpdateUser(
            opponent.id,
          );

          if (
            amount > authorData.userBalance ||
            amount > opponentData.userBalance
          )
            return;

          const winner = Math.random() < 0.5 ? message.author : opponent;
          const loser =
            winner.id === message.author.id ? opponent : message.author;

          await this.client.database.updateUserBalance(winner.id, amount);
          await this.client.database.updateUserBalance(loser.id, -amount);
          await this.client.database.createTransaction({
            source: 6,
            givenBy: loser.id,
            receivedBy: winner.id,
            givenByUsername: loser.username,
            receivedByUsername: winner.username,
            givenAt: Date.now(),
            transactionAmount: amount,
          });

          return int.followUp({
            content: `🪙 ${winner}, o resultado foi **${
              winner.id === message.author.id ? "cara" : "coroa"
            }**!\nVocê ganhou uma aposta contra ${loser}, no valor de ${
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

        int.message.edit({
          content: `❌ ${int.user} e ${opponent}, essa aposta foi cancelada.`,
          components: [buttons],
        });

        return;
      }
    });

    collector.on("end", (collected, reason) => {
      if (reason === "time" && !finished) {
        msg.edit({
          content: `⏳ ${message.author} e ${opponent}, tempo para aceitar a aposta acabou!`,
          components: [],
        });
      }
    });
  }
}
