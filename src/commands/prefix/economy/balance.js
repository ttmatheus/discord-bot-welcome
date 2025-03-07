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
      commandName: "saldo",
      commandAliases: ["balance", "bal", "atm", "moedas"],
      commandDescription:
        "Mostra o seu saldo com a sua posição no placar ou de outro usuário.",
      commandCategory: "economy",
      commandUsage: [
        {
          name: "usuário",
          type: "string",
          required: false,
        },
      ],
      commandCooldown: 1,
    });
  }

  async execute(message, args) {
    const user = await this.client.clientUtils.findUser(args[0], message);
    const data = await this.client.database.getOrUpdateUser(user.id);
    const position = await this.client.database.users.model.countDocuments({
      userBalance: {
        $gt: data.userBalance,
      },
    });

    return message.reply({
      content: `${message.author}, ${
        user.id !== message.author.id
          ? `o usuário \`@${user.username}\` \`(${user.id}\`)`
          : `você`
      } tem um total de ${
        this.client.economy.emojis.money
      } **${this.client.utils.formatNumberToLocale(data.userBalance)} ${
        this.client.economy.names.money
      }** no saldo ${
        data.userBalance === 0
          ? `e não está classificado no placar...`
          : `e está em **#${position + 1}** no placar dos usuários com mais ${
              this.client.economy.names.money
            }!`
      }`,
    });
  }
}
