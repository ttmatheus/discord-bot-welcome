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
      commandName: "trocarusername",
      commandAliases: ["trocaruser", "tu", "cu", "changeusername"],
      commandDescription:
        "Troque o usuário da aplicação através desse comando.",
      commandCategory: "development",
      commandUsage: [
        {
          name: "nome",
          type: "string",
          required: true,
        },
      ],
      commandCooldown: 0,
      userPermissions: ["Dev"],
    });
  }

  async execute(message, args) {
    let username = args.join(" ");

    if (!username || username.length > 30 || username.length < 3)
      return message.reply({
        content: `❌ ${message.author}, esse não é um nome válido para uma aplicação!`,
      });

    try {
      await this.client.user.setUsername(username);

      message.reply({
        content: `✅ ${message.author}, o nome de usuário dessa aplicação foi definido como "\`${username}\`" com sucesso!`,
      });
    } catch (err) {
      this.client.logger.error(
        "Não consegui alterar meu nome de usuário!",
        err,
      );
      return message.reply({
        content: `❌ ${message.author}, ocorreu um erro e eu não consegui alterar o meu nome de usuário! Tente novamente mais tarde.`,
      });
    }
  }
}
