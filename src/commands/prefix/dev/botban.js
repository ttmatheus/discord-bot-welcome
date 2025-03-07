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
      commandName: "botban",
      commandAliases: ["appban", "banbot"],
      commandDescription:
        "Bana um usuário permanentemente de utilizar os recursos da aplicação.",
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
    const reason =
      args.slice(1).join(" ") || "nenhuma razão específicada no banimento...";

    if (
      !target ||
      target.bot ||
      target.id === message.author.id ||
      this.client.config.developerPermissions[message.author.id]?.some((perm) =>
        ["Admin", "Dev"].includes(perm),
      )
    )
      return message.reply({
        content: `❌ ${message.author}, você precisa especificar um usuário válido continuar com esta ação...`,
      });

    await this.client.logger.event(
      `O usuário @${message.author.username} (${message.author.id}) baniu o usuário @${target.username} (${target.id}) com a razão de: ${reason}.`,
    );
    await this.client.database.getOrUpdateUser(target.id, {
      $set: {
        "userBanishmentData.banReason": reason,
        "userBanishmentData.banTimestamp": Date.now(),
        "userBanishmentData.banAuthor": message.author.id,
      },
    });

    return await message.reply({
      content: `✅ ${message.author}, você **baniu** o usuário ${target} de utilizar os comandos da aplicação com a razão: \`${reason}\`!`,
    });
  }
}
