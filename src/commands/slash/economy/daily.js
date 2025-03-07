import { CommandBase } from "../../../structures/commands.js";

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
  MessageFlags,
} from "discord.js";

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      slashCommandData: new SlashCommandBuilder()
        .setName("diário")
        .setDescription("Resgate sua recompensa diária.")
        .setNameLocalizations({
          "pt-BR": "diário",
          "en-US": "daily",
        })
        .setDescriptionLocalizations({
          "pt-BR": "Resgate sua recompensa diária.",
          "en-US": "Claim your daily prize.",
        })
        .setContexts(["Guild"]),
      commandName: "diário",
      commandAliases: ["daily", "claimdaily", "resgatardiário"],
      commandDescription: "Resgate sua recompensa diária.",
      commandCategory: "economy",
      commandCooldown: 2,
    });
  }

  async execute(interaction) {
    const reset = this.client.economy.resets.daily;

    let now = new Date();
    let cooldown = new Date(now);

    cooldown.setHours(reset.hour, reset.minute, 0, 0);

    if (now >= cooldown) {
      cooldown.setDate(cooldown.getDate() + 1);
    }

    const prize = this.client.utils.genNumber(
      this.client.economy.prizes.daily.min,
      this.client.economy.prizes.daily.max,
    );
    const data = await this.client.database.getOrUpdateUser(
      interaction.user.id,
    );

    if (data.userGlobalCooldowns.dailyCooldown > Date.now())
      return interaction.reply({
        content: `⏰ ${
          interaction.user
        }, você precisa esperar \`${this.client.utils.formatTimeString(
          data.userGlobalCooldowns.dailyCooldown,
        )}\` antes de utilizar esse comando novamente!`,
        flags: MessageFlags.Ephemeral,
      });

    await this.client.database.updateUserBalance(interaction.user.id, prize);
    await this.client.database.updateUserCooldowns(
      interaction.user.id,
      cooldown,
      "dailyCooldown",
    );
    await this.client.database.createTransaction({
      source: 2,
      receivedBy: interaction.user.id,
      receivedByUsername: interaction.user.username,
      givenAt: Date.now(),
      transactionAmount: prize,
    });

    const embed = new EmbedBuilder()

      .setFooter({
        text: `@${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp()
      .setColor(this.client.config.embedColors.default)

      .setTitle(`Recompensa diária`)
      .setDescription(
        `Você coletou sua recompensa diária com sucesso, parabéns! Suas recompensas foram:`,
      )

      .setFields([
        {
          name: `Recompensas`,
          value: `-# - ${
            this.client.economy.emojis.money
          } **${this.client.utils.formatNumberToLocale(prize)}** ${
            this.client.economy.names.money
          }`,
        },
      ]);

    return interaction.reply({
      content: interaction.user.toString(),
      embeds: [embed],
    });
  }
}
