import { EventListener } from "../../structures/events.js";

import colors from "colors";

import { EmbedBuilder } from "discord.js";

import permissionsJSON from "../../assets/json/permissions.json" with { type: "json"}

export default class Event extends EventListener {
  constructor(client) {
    super(client, {
      eventName: "messageCreate",
    });
  }

  async execute(message) {
    if (
      message.author.bot ||
      !message.content.startsWith(this.client.config.globalPrefix) ||
      !message.guild
    )
      return;

    const args = message.content
      .slice(this.client.config.globalPrefix.length)
      .trim()
      .split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command =
      this.client.prefixCommands.get(commandName) ||
      this.client.prefixCommands.find((cmd) =>
        cmd.commandAliases?.includes(commandName),
      );

    if (!command) return;

    const userData = await this.client.database.getOrUpdateUser(
      message.author.id,
    );
    const userPerms =
      this.client.config.developerPermissions[message.author.id] || [];
    if (
      command.userPermissions.length &&
      !userPerms.some((role) => command.userPermissions.includes(role))
    ) {
      return message.reply({
        content: `❌ ${message.author}, você não tem permissão para usar este comando!`,
      });
    }

    if (userData.userBanishmentData.banTimestamp > 0) {
      return message.reply({
        content: `❌ ${
          message.author
        }, você está proíbido de utilizar meus comandos!\n-# - Data do banimento: <t:${Math.floor(
          userData.userBanishmentData.banTimestamp / 1000,
        )}> (<t:${Math.floor(
          userData.userBanishmentData.banTimestamp / 1000,
        )}:R>)\n-# - Razão do banimento: \`${
          userData.userBanishmentData.banReason
        }\``,
      });
    }

    if (
      command.commandDisabled &&
      !userPerms.some((role) => ["Dev", "Admin"].includes(role))
    ) {
      return message.reply({
        content: `❕ ${message.author}, você não tem permissão para usar este comando, ou ele está desativado.`,
      });
    }

    if (command.memberPermissions.length) {
      const missingPermissions = command.memberPermissions.filter(
        (perm) => !message.member.permissions.has(perm),
      );
      if (missingPermissions.length > 0) {
        const translatedPermissions = missingPermissions.map(
          (perm) => permissionsJSON[perm] || perm,
        );
        return message.reply({
          content: `❌ ${
            message.author
          }, você precisa das seguintes permissões para usar este comando: **${translatedPermissions.join(
            ", ",
          )}**.`,
        });
      }
    }

    const commandCooldown = await this.userCommandsCooldown(message, command);
    if (commandCooldown)
      return message.reply({
        content: commandCooldown,
      });

    if (await this.checkAndShowUsage(command, message, args)) return;

    await command.execute(message, args);
  }

  async userCommandsCooldown(message, command) {
    const now = Date.now();
    const cooldownData = this.client.userCommandsCooldown.get(message.author.id) ?? { warns: 0, time: 0 };
    if (this.client.config.developerPermissions[message.author.id]?.some(perm => ["Admin", "Dev"].includes(perm))) return false;
  
    if (cooldownData.time >= now) {
      cooldownData.warns++;
      cooldownData.time += command.commandCooldown * Math.pow(1.25, cooldownData.warns - 1);
  
      this.client.userCommandsCooldown.set(message.author.id, cooldownData);
      return `⏳ ${message.author}, aguarde **${this.client.utils.formatTimeString(
        cooldownData.time,
        2
      )}** antes de usar outro comando. \`(AVISO: ${cooldownData.warns})\``;
    }
  
    this.client.userCommandsCooldown.set(message.author.id, { warns: 0, time: now + command.commandCooldown });
    return false;
  }

  async checkAndShowUsage(command, message, args) {
    if (
      ["help", "ajuda"].includes(args[0]) ||
      (!args.length &&
        command.commandUsage.filter(
          (x) => x.type !== "attachment" && x.required,
        ).length > 0)
    ) {
      const usage = command.commandUsage
        .map((arg) => {
          return ` ${arg.required ? "<" : "["}${arg.name}: ${arg.type}${
            arg.required ? ">" : "]"
          }`;
        })
        .join(", ");
      const permissions = command.memberPermissions.map(
        (perm) => permissionsJSON[perm] || perm,
      );
      const slash = this.client.slashCommands.get(command.commandName);

      const embed = new EmbedBuilder()

        .setColor(this.client.config.embedColors.green)
        .setTimestamp()
        .setFooter({
          text: `@${message.author.username}`,
          iconURL: message.author.displayAvatarURL(),
        })

        .setTitle(`🍃 \`${command.commandName}\``)
        .setDescription(`${command.commandDescription}`)

        .setFields([
          {
            name: `❔ Como usar`,
            value: `\`${this.client.config.globalPrefix}${command.commandName}${usage}\``,
            inline: false,
          },
          {
            name: `🔹 Permissões`,
            value: `${
              permissions.length === 0
                ? `Esse comando não requer permissões especiais.`
                : `\`${permissions.join(", ")}\``
            }`,
            inline: false,
          },
          {
            name: `🔡 Sinônimos`,
            value: `Comandos de barra: \`${
              slash ? `/${slash.slashCommandData.name}` : "desativado."
            }\`\nComandos de prefixo: ${
              command.commandAliases.length === 0
                ? "nenhum sinônimo para esse comando encontrado..."
                : command.commandAliases
                    .map(
                      (alias) =>
                        `\`${this.client.config.globalPrefix}${alias}\``,
                    )
                    .join(", ")
            }`,
            inline: false,
          },
        ])

        .setAuthor({
          name: `Veja todos os meus comandos usando o comando ${this.client.config.globalPrefix}ajuda`,
          iconURL: this.client.user.displayAvatarURL(),
        });

      return message.reply({
        content: message.author.toString(),
        embeds: [embed],
      });
    }
  }
}
