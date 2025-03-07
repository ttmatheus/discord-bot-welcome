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
      commandName: "semanal",
      commandAliases: ["weekly", "claimweekly", "resgatarsemanal"],
      commandDescription: "Resgate sua recompensa diária.",
      commandCategory: "economy",
      commandCooldown: 2,
    });
  }

  async execute(message, args) {
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
    const data = await this.client.database.getOrUpdateUser(message.author.id);

    if (data.userGlobalCooldowns.weeklyCooldown > Date.now())
      return message.reply({
        content: `⏰ ${
          message.author
        }, você precisa esperar \`${this.client.utils.formatTimeString(
          data.userGlobalCooldowns.weeklyCooldown,
        )}\` antes de utilizar esse comando novamente!`,
      });

    await this.client.database.updateUserBalance(message.author.id, prize);
    await this.client.database.updateUserCooldowns(
      message.author.id,
      cooldown,
      "weeklyCooldown",
    );
    await this.client.database.createTransaction({
      source: 3,
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

    return message.reply({
      content: message.author.toString(),
      embeds: [embed],
    });
  }
}
