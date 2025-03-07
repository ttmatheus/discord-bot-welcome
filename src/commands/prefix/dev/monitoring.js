import { CommandBase } from "../../../structures/commands.js";
import { EmbedBuilder, AttachmentBuilder, version } from "discord.js";

import os from "os";

export default class BotInfoCommand extends CommandBase {
  constructor(client) {
    super(client, {
      commandName: "checkup",
      commandAliases: ["cp"],
      commandDescription: "Mostra informações de monitoramento da aplicação.",
      commandCategory: "miscellaneous",
      commandCooldown: 0,
      userPermissions: ["Dev"],
    });
  }

  async execute(message, args) {
    const totalGuilds = this.client.guilds.cache.size;
    const totalUsers = this.client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0,
    );
    const attachment = new AttachmentBuilder("./src/assets/images/jardim.png", {
      name: "jardim.png",
    });

    const cpuUsage = os.loadavg()[0];
    const memoryUsage = process.memoryUsage();
    const heapUsed = this.formatBytes(memoryUsage.heapUsed);
    const rss = this.formatBytes(memoryUsage.rss);

    const embed = new EmbedBuilder()

      .setColor(this.client.config.embedColors.green)
      .setTitle("Monitoramento - Aplicação")
      .setDescription(
        `-# Aqui estão as últimas informações sobre o diagnóstico do sistema:`,
      )

      .setColor(this.client.config.embedColors.green)
      .setTimestamp()
      .setFooter({
        text: `@${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
      })

      .setAuthor({
        name: `@${this.client.user.username}!`,
        iconURL: this.client.user.displayAvatarURL(),
        url: this.client.config.guildLinks.jardim.url,
      })
      .setThumbnail("attachment://jardim.png")

      .addFields(
        {
          name: "Servidores",
          value: `-# ${totalGuilds.toLocaleString()}`,
          inline: true,
        },
        {
          name: "Usuários",
          value: `-# ${totalUsers.toLocaleString()}`,
          inline: true,
        },
        {
          name: "Uso da CPU",
          value: `-# ${cpuUsage.toFixed(2)}%`,
          inline: true,
        },
        {
          name: "Memória Usada `(HEAP)`",
          value: `-# ${heapUsed}`,
          inline: true,
        },
        {
          name: "Memória Usada `(RSS)`",
          value: `-# ${rss}`,
          inline: true,
        },
        {
          name: "Versão do Node.js",
          value: `-# ${process.version}`,
          inline: true,
        },
        {
          name: "Versão do Discord.js",
          value: `-# ${version}`,
          inline: true,
        },
      );

    return message.reply({
      content: message.author.toString(),
      embeds: [embed],
      files: [attachment],
    });
  }

  formatBytes(bytes) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unit = 0;

    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }

    return `${size.toFixed(2)} ${units[unit]}`;
  }
}
