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
      commandName: "botunban",
      commandAliases: ["appunban", "unbanbot"],
      commandDescription: "Remova o banimento da aplicação de um usuário.",
      commandCategory: "development",
      commandUsage: [
        {
          name: "usuário",
          type: "string",
          required: true,
        },
        {
          name: "razão",
          type: "string",
          required: false,
        },
      ],
      commandCooldown: 0,
      userPermissions: ["Mod"],
    });
  }

  async execute(message, args) {
    const target = await this.client.clientUtils.findUser(
      args[0],
      message,
      false,
    );
    const reason = args.slice(1).join(" ") || "nenhuma razão específicada...";

    await this.client.logger.event(
      `O usuário @${message.author.username} (${message.author.id}) removeu a punição do usuário @${target.username} (${target.id}) com a razão de: ${reason}.`,
    );
    await this.client.database.getOrUpdateUser(target.id, {
      $set: {
        "userBanishmentData.banTimestamp": 0,
      },
    });

    return await message.reply({
      content: `✅ ${message.author}, você **removeu o banimento** do usuário ${target} com a razão: \`${reason}\`!`,
    });
  }
}
