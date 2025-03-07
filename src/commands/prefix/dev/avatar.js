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
      commandName: "trocaravatar",
      commandAliases: ["ca", "ta", "ca", "changeavatar"],
      commandDescription: "Troque o avatar da aplicação através desse comando.",
      commandCategory: "development",
      commandUsage: [
        {
          name: "avatar",
          type: "attachment",
          required: true,
        },
      ],
      commandCooldown: 0,
      userPermissions: ["Dev"],
    });
  }

  async execute(message, args) {
    let avatar;

    if (message.attachments.size) avatar = message.attachments.first().url;
    else avatar = args[0];

    try {
      if (!avatar) await this.client.user.setAvatar(null);
      else await this.client.user.setAvatar(avatar);

      return message.reply({
        content: `✅ ${message.author}, o avatar da aplicação foi alterado com sucesso!`,
      });
    } catch (err) {
      this.client.logger.error("Não consegui alterar meu avatar!", err);
      return message.reply({
        content: `❌ ${message.author}, ocorreu um erro e eu não consegui alterar o meu avatar! Você anexou uma imagem válida?`,
      });
    }
  }
}
