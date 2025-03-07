import { CommandBase } from "../../../structures/commands.js";

import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      commandName: "convite",
      commandAliases: ["servidor", "invite", "links"],
      commandDescription:
        "Mostra os links de redirecionamento para os servidores da aplicação.",
      commandCategory: "informations",
      commandCooldown: 1,
    });
  }

  async execute(message, args) {
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

    buttons.push(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setEmoji("✉️")
        .setLabel("Me adicione")
        .setURL(
          `https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=8&scope=bot%20applications.commands`,
        ),
    );

    const row = new ActionRowBuilder().addComponents(buttons);

    return message.reply({
      content: `🔗 ${message.author}, aqui estão os links de redirecionamento para meus servidores!`,
      components: [row],
    });
  }
}
