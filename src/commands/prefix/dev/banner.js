import { CommandBase } from "../../../structures/commands.js";

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  EmbedBuilder,
} from "discord.js";

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      commandName: "trocarbanner",
      commandAliases: ["cb", "changebanner"],
      commandDescription:
        "Troque o fundo de perfil da aplicação através desse comando.",
      commandCategory: "development",
      commandUsage: [
        {
          name: "fundo",
          type: "attachment",
          required: true,
        },
      ],
      commandCooldown: 0,
      userPermissions: ["Dev"],
    });
  }

  async execute(message, args) {
    let banner;
    if (message.attachments.size) banner = message.attachments.first().url;
    else banner = args[0];

    try {
      if (!banner) {
        await this.client.user.setBanner(null);
      } else {
        await this.client.user.setBanner(banner);
      }
      return message.reply({
        content: `✅ ${message.author}, o fundo de perfil da aplicação foi alterado com sucesso!`,
      });
    } catch (err) {
      this.client.logger.error(
        "Não consegui alterar meu fundo de perfil!",
        err,
      );
      return message.reply({
        content: `❌ ${message.author}, ocorreu um erro e eu não consegui alterar o meu fundo de perfil! Você anexou uma imagem válida?`,
      });
    }
  }
}
