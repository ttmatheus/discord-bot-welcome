import { CommandBase } from "../../../structures/commands.js";

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      commandName: "trabalhar",
      commandAliases: ["work", "trabalho", "job"],
      commandDescription: "Trabalhe e ganhe dinheiro.",
      commandCategory: "economy",
      commandCooldown: 2,
    });
  }

  async execute(message, args) {
    const economy = this.client.economy;
    const cooldown = Date.now() + economy.settings.work.cooldown * 60_000;
    const prize = this.client.utils.genNumber(
      this.client.economy.prizes.work.min,
      this.client.economy.prizes.work.max,
    );
    const data = await this.client.database.getOrUpdateUser(message.author.id);
    const phrase =
      economy.settings.work.phrases[
        Math.floor(Math.random() * economy.settings.work.phrases.length)
      ];

    if (data.userGlobalCooldowns.workCooldown > Date.now())
      return message.reply({
        content: `⏰ ${
          message.author
        }, você precisa esperar \`${this.client.utils.formatTimeString(
          data.userGlobalCooldowns.workCooldown,
        )}\` antes de utilizar esse comando novamente!`,
      });

    await this.client.database.updateUserBalance(message.author.id, prize);
    await this.client.database.updateUserCooldowns(
      message.author.id,
      cooldown,
      "workCooldown",
    );
    await this.client.database.createTransaction({
      source: 4,
      receivedBy: message.author.id,
      receivedByUsername: message.author.username,
      givenAt: Date.now(),
      transactionAmount: prize,
    });

    return message.reply({
      content: `💼 ${message.author}, que legal! ${phrase.replace(
        "{amount}",
        `${economy.emojis.money} **${this.client.utils.formatNumberToLocale(
          prize,
        )} ${economy.names.money}**`,
      )}`,
    });
  }
}
