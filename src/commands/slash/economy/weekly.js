import { CommandBase } from "../../../structures/commands.js";

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      slashCommandData: new SlashCommandBuilder()
        .setName("semanal")
        .setDescription("Resgate sua recompensa semanal.")
        .setNameLocalizations({
          "pt-BR": "semanal",
          "en-US": "weekly",
        })
        .setDescriptionLocalizations({
          "pt-BR": "Resgate sua recompensa semanal.",
          "en-US": "Claim your weekly prize.",
        })
        .setContexts(["Guild"]),
      commandName: "semanal",
      commandAliases: ["weekly", "claimweekly", "resgatarsemanal"],
      commandDescription: "Resgate sua recompensa diária.",
      commandCategory: "economy",
      commandCooldown: 2,
    });
  }

  async execute(interaction) {
    const reset = this.client.economy.resets.weekly;

    let now = new Date();
    let daysUntilReset = (reset.day - now.getDay() + 7) % 7;
    if (
      daysUntilReset === 0 &&
      now.getHours() >= reset.hour &&
      now.getMinutes() >= reset.minute
    ) {
      daysUntilReset = 7;
    }

    let cooldown = new Date(now);
    cooldown.setDate(now.getDate() + daysUntilReset);
    cooldown.setHours(reset.hour, reset.minute, 0, 0);

    const prize = this.client.utils.genNumber(
      this.client.economy.prizes.weekly.min,
      this.client.economy.prizes.weekly.max,
    );
    const data = await this.client.database.getOrUpdateUser(
      interaction.user.id,
    );

    if (data.userGlobalCooldowns.weeklyCooldown > Date.now())
      return interaction.reply({
        content: `⏰ ${
          interaction.user
        }, você precisa esperar \`${this.client.utils.formatTimeString(
          data.userGlobalCooldowns.weeklyCooldown,
        )}\` antes de utilizar esse comando novamente!`,
        flags: MessageFlags.Ephemeral,
      });

    await this.client.database.updateUserBalance(interaction.user.id, prize);
    await this.client.database.updateUserCooldowns(
      interaction.user.id,
      cooldown,
      "weeklyCooldown",
    );
    await this.client.database.createTransaction({
      source: 3,
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

      .setTitle(`Recompensa semanal`)
      .setDescription(
        `Você coletou sua recompensa semanal com sucesso, parabéns! Suas recompensas foram:`,
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
