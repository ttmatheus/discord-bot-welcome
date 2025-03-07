import { CommandBase } from "../../../structures/commands.js";

import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
} from "discord.js";

import pkg from "../../../../package.json" with { type: "json" };

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      slashCommandData: new SlashCommandBuilder()
        .setName("informações")
        .setDescription("Veja algumas informações úteis sobre a aplicação.")
        .setNameLocalizations({
          "pt-BR": "informações",
          "en-US": "informations",
        })
        .setDescriptionLocalizations({
          "pt-BR": "Veja algumas informações úteis sobre a aplicação.",
          "en-US": "See some useful information about the application.",
        })
        .setContexts(["Guild"]),
      commandName: "informações",
      commandAliases: [
        "info",
        "infobot",
        "informations",
        "informacoes",
        "botinfo",
      ],
      commandDescription: "Veja algumas informações úteis sobre a aplicação.",
      commandCategory: "informations",
      commandCooldown: 1,
    });
  }

  async execute(interaction) {
    const prefix = this.client.config.globalPrefix;
    const attachment = new AttachmentBuilder("./src/assets/images/jardim.png", {
      name: "jardim.png",
    });

    const embed = new EmbedBuilder()
    
      .setColor(this.client.config.embedColors.default)
      .setTimestamp()
      .setFooter({
        text: `@${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })

      .setDescription(
        `Olá, sou o **${this.client.user.username}** e estou na versão \`(${
          pkg.version
        })\`!\nSou uma aplicação criada e desenvolvida pelo <:jardim:1181076936366248008> **[Jardim](${
          this.client.config.guildLinks.jardim.url
        })**, uma loja especializada em desenvolvimento de aplicações personalizadas para Discord. Atualmente estou em **${
          this.client.guilds.cache.size
        }** servidores e tenho **${this.client.guilds.cache.reduce(
          (acc, guild) => acc + guild.memberCount,
          0,
        )}** usuários!\nFui desenvolvido em <:lang_js:1342934793981001838> **[JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)**, utilizando <:icon_nodejs:1342934834632327198> **[Node.js](https://nodejs.org/pt)** e <:icon_djs:1345736647425134672> **[Discord.js](https://discord.js.org/)**. Para ver minha lista de comandos, utilize o comando \`${prefix}ajuda\`!`,
      )

      .setThumbnail("attachment://jardim.png")
      .setAuthor({
        name: `Olá, eu sou o @${this.client.user.username}!`,
        iconURL: this.client.user.displayAvatarURL(),
        url: this.client.config.guildLinks.jardim.url,
      });

    const guildLinks = this.client.config.guildLinks;
    const validLinks = Object.entries(guildLinks).filter(
      ([_, link]) => link.url,
    );

    const buttons = validLinks.map(([name, link]) =>
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel(link.name || "Servidor")
        .setEmoji(link.emoji || "🔗")
        .setURL(link.url),
    );

    const row = new ActionRowBuilder().addComponents(buttons);

    return interaction.reply({
      content: interaction.user.toString(),
      embeds: [embed],
      files: [attachment],
      components: [row],
    });
  }
}
