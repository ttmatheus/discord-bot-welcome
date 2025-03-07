import { CommandBase } from "../../../structures/commands.js";

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  EmbedBuilder,
  PermissionsBitField,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      slashCommandData: new SlashCommandBuilder()
        .setName("trabalhar")
        .setDescription("Trabalhe e ganhe dinheiro.")
        .setNameLocalizations({
          "pt-BR": "trabalhar",
          "en-US": "work",
        })
        .setDescriptionLocalizations({
          "pt-BR": "Trabalhe e ganhe dinheiro.",
          "en-US": "Work and earn money.",
        })
        .setContexts(["Guild"]),
      commandName: "trabalhar",
      commandAliases: ["work", "trabalho", "job"],
      commandDescription: "Trabalhe e ganhe dinheiro.",
      commandCategory: "economy",
      commandCooldown: 2,
    });
  }

  async execute(interaction) {
    const economy = this.client.economy;
    const cooldown = Date.now() + economy.settings.work.cooldown * 60_000;
    const prize = this.client.utils.genNumber(
      this.client.economy.prizes.work.min,
      this.client.economy.prizes.work.max,
    );
    const data = await this.client.database.getOrUpdateUser(
      interaction.user.id,
    );
    const phrase =
      economy.settings.work.phrases[
        Math.floor(Math.random() * economy.settings.work.phrases.length)
      ];

    if (data.userGlobalCooldowns.workCooldown > Date.now())
      return interaction.reply({
        content: `⏰ ${
          interaction.user
        }, você precisa esperar \`${this.client.utils.formatTimeString(
          data.userGlobalCooldowns.workCooldown,
        )}\` antes de utilizar esse comando novamente!`,
        flags: MessageFlags.Ephemeral,
      });

    await this.client.database.updateUserBalance(interaction.user.id, prize);
    await this.client.database.updateUserCooldowns(
      interaction.user.id,
      cooldown,
      "workCooldown",
    );
    await this.client.database.createTransaction({
      source: 4,
      receivedBy: interaction.user.id,
      receivedByUsername: interaction.user.username,
      givenAt: Date.now(),
      transactionAmount: prize,
    });

    return interaction.reply({
      content: `💼 ${interaction.user}, que legal! ${phrase.replace(
        "{amount}",
        `${economy.emojis.money} **${this.client.utils.formatNumberToLocale(
          prize,
        )} ${economy.names.money}**`,
      )}`,
    });
  }
}
