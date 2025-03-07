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
      commandName: "diário",
      commandAliases: ["daily", "claimdaily", "resgatardiário"],
      commandDescription: "Resgate sua recompensa diária.",
      commandCategory: "economy",
      commandCooldown: 2,
    });
  }

  async execute(message, args) {
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
    const data = await this.client.database.getOrUpdateUser(message.author.id);

    if (data.userGlobalCooldowns.dailyCooldown > Date.now())
      return message.reply({
        content: `⏰ ${
          message.author
        }, você precisa esperar \`${this.client.utils.formatTimeString(
          data.userGlobalCooldowns.dailyCooldown,
        )}\` antes de utilizar esse comando novamente!`,
      });

    await this.client.database.updateUserBalance(message.author.id, prize);
    await this.client.database.updateUserCooldowns(
      message.author.id,
      cooldown,
      "dailyCooldown",
    );
    await this.client.database.createTransaction({
      source: 2,
      receivedBy: message.author.id,
      receivedByUsername: message.author.username,
      givenAt: Date.now(),
      transactionAmount: prize,
    });

    const embed = new EmbedBuilder()

      .setFooter({
        text: `@${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
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

    return message.reply({
      content: message.author.toString(),
      embeds: [embed],
    });
  }
}
