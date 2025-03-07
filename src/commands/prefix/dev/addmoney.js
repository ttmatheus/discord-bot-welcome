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
      commandName: "addmoney",
      commandAliases: ["am"],
      commandDescription: "Adicione saldo a algum usuário.",
      commandCategory: "development",
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
      commandCooldown: 0,
      userPermissions: ["Admin"],
    });
  }

  async execute(message, args) {
    const creditor = await this.client.clientUtils.findUser(
      args[0],
      message,
      false,
    );
    const economy = this.client.economy;

    if (!creditor || creditor.bot)
      return message.reply({
        content: `❌ ${message.author}, você precisa especificar um usuário válido continuar com esta ação...`,
      });

    const amount = this.client.utils.formatNumber(args[1]);

    if (typeof amount !== "number")
      return message.reply({
        content: `❌ ${message.author}, você precisa especificar um valor válido para continuar com esta ação...`,
      });

    await this.client.logger.event(
      `O usuário @${message.author.username} (${
        message.author.id
      }) adicionou ${this.client.utils.formatNumberToLocale(amount)} ${
        economy.names.money
      } ao saldo do usuário @${creditor.username} (${creditor.id})`,
    );
    await this.client.database.updateUserBalance(creditor.id, amount);
    await this.client.database.createTransaction({
      source: 1,
      receivedBy: creditor.id,
      receivedByUsername: creditor.username,
      givenAt: Date.now(),
      transactionAmount: amount,
    });

    return await message.reply({
      content: `✅ ${message.author}, você **adicionou** ${
        economy.emojis.money
      } **${this.client.utils.formatNumberToLocale(amount)} ${
        economy.names.money
      }** ao saldo do usuário!`,
    });
  }
}
