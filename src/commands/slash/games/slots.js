import { CommandBase } from "../../../structures/commands.js";
import { EmbedBuilder, SlashCommandBuilder, MessageFlags } from "discord.js";

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      slashCommandData: new SlashCommandBuilder()
        .setName("cassino")
        .setDescription("Tente a sorte no caça-níqueis!")
        .setNameLocalizations({ "pt-BR": "cassino", "en-US": "slots" })
        .setDescriptionLocalizations({
          "pt-BR": "Tente a sorte no caça-níqueis.",
          "en-US": "Try your luck at the slot machine.",
        })
        .setContexts(["Guild"])
        .addStringOption((option) =>
          option
            .setName("valor")
            .setDescription("O valor que você deseja apostar.")
            .setNameLocalizations({ "pt-BR": "valor", "en-US": "amount" })
            .setDescriptionLocalizations({
              "pt-BR": "O valor que você deseja apostar.",
              "en-US": "The amount you want to bet.",
            })
            .setAutocomplete(true)
            .setRequired(true),
        ),
      commandName: "slots",
      commandAliases: ["slot", "cassino"],
      commandDescription: "Tente a sorte no caça-níqueis!",
      commandCategory: "games",
      commandCooldown: 2,
    });
  }

  async execute(interaction) {
    const user = await this.client.database.getOrUpdateUser(
      interaction.user.id,
    );
    const economy = this.client.economy;
    const amount = this.client.utils.formatNumber(
      interaction.options.getString("valor"),
      user.userBalance,
    );

    if (
      typeof amount !== "number" ||
      amount < economy.limiters.slots.min ||
      amount > economy.limiters.slots.max
    )
      return interaction.reply({
        content: `❌ ${
          interaction.user
        }, você precisa especificar um valor válido para essa aposta \`(entre ${this.client.utils.formatNumberToLocale(
          economy.limiters.slots.min,
        )} e ${this.client.utils.formatNumberToLocale(
          economy.limiters.slots.max,
        )})\`...`,
        flags: MessageFlags.Ephemeral,
      });

    if (amount > user.userBalance)
      return interaction.reply({
        content: `❌ ${interaction.user}, você não tem saldo suficiente para completar a aposta...`,
        flags: MessageFlags.Ephemeral,
      });

    const emojiKeys = Object.keys(economy.settings.slots.emojis);
    const slots = Array.from({ length: 3 }, () =>
      Array.from(
        { length: 3 },
        () => emojiKeys[Math.floor(Math.random() * emojiKeys.length)],
      ),
    );

    const embed = new EmbedBuilder()

      .setTitle(`🎰 Caça-níqueis`)
      .setFields([
        { name: "Roleta", value: this.formatSlots(slots), inline: true },
      ])

      .setTimestamp()
      .setFooter({
        text: `@${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    const win = this.calculateWin(slots, amount, economy.settings.slots.emojis);

    await this.client.database.updateUserBalance(
      interaction.user.id,
      win - amount,
    );

    embed.setDescription(
      win > 0
        ? `Você **ganhou ${
            economy.emojis.money
          } ${this.client.utils.formatNumberToLocale(win)}** ${
            economy.names.money
          }!`
        : `Você **perdeu ${
            economy.emojis.money
          } ${this.client.utils.formatNumberToLocale(amount)}** ${
            economy.names.money
          }...`,
    );
    embed.setColor(
      win > 0
        ? this.client.config.embedColors.green
        : this.client.config.embedColors.red,
    );

    return interaction.reply({
      content: interaction.user.toString(),
      embeds: [embed],
    });
  }

  formatSlots(slots) {
    return slots.map((row) => row.join(" ")).join("\n");
  }

  calculateWin(slots, aposta, emojis) {
    let win = 0;

    for (let i = 0; i < 3; i++) {
      if (slots[i][0] === slots[i][1] && slots[i][1] === slots[i][2]) {
        win += aposta * emojis[slots[i][0]];
      }
    }

    for (let j = 0; j < 3; j++) {
      if (slots[0][j] === slots[1][j] && slots[1][j] === slots[2][j]) {
        win += aposta * emojis[slots[0][j]];
      }
    }

    if (slots[0][0] === slots[1][1] && slots[1][1] === slots[2][2]) {
      win += aposta * emojis[slots[0][0]];
    }
    if (slots[0][2] === slots[1][1] && slots[1][1] === slots[2][0]) {
      win += aposta * emojis[slots[0][2]];
    }

    return win;
  }
}
