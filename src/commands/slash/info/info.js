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
    const attachment = new AttachmentBuilder("./src/assets/images/example.png", {
      name: "example.png",
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
        })\`!\nAtualmente estou em **${
          this.client.guilds.cache.size
        }** servidores e tenho **${this.client.guilds.cache.reduce(
          (acc, guild) => acc + guild.memberCount,
          0,
        )}** usuários!\nFui desenvolvido em <:lang_js:1342934793981001838> **[JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)**, utilizando <:icon_nodejs:1342934834632327198> **[Node.js](https://nodejs.org/pt)** e <:icon_djs:1345736647425134672> **[Discord.js](https://discord.js.org/)**. Para ver minha lista de comandos, utilize o comando \`/ajuda\`!`,
      )

      .setThumbnail("attachment://example.png")
      .setAuthor({
        name: `Olá, eu sou o @${this.client.user.username}!`,
        iconURL: this.client.user.displayAvatarURL(),
        url: this.client.config.guildLinks.guild.url,
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
