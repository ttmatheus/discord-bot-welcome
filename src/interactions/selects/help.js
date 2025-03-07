import { InteractionBase } from "../../structures/interactions.js";

import { EmbedBuilder, AttachmentBuilder } from "discord.js";

export default class Interaction extends InteractionBase {
  constructor(client) {
    super(client, {
      name: "help",
      type: "selects",
    });
  }

  async execute(interaction) {
    if (!interaction.customId.includes(interaction.user.id)) return;

    const category = interaction.values[0];
    if (category === "development") return;

    const commands = this.client.prefixCommands;
    const categories = new Map();
    const categoriesAssets = {
      miscellaneous: {
        name: "Diversos",
        description:
          "Comandos diversos que podem te ajudar em alguma coisas...",
        emoji: "🍃",
      },
      informations: {
        name: "Informativos",
        description:
          "Comandos que te informam sobre algo específico, como a minha latência, por exemplo...",
        emoji: "❔",
      },
      economy: {
        name: "Economia",
        description:
          "Comandos de entretenimento voltados a uma economia global...",
        emoji: "💸",
      },
      games: {
        name: "Jogos",
        description: "Comandos de entretenimento jogos e apostas...",
        emoji: "🎲",
      },
    };

    for (const [name, command] of commands) {
      if (!categories.has(command.commandCategory)) {
        categories.set(command.commandCategory, []);
      }
      categories.get(command.commandCategory).push(command);
    }

    const categoryCommands = categories.get(category);
    const categoryEmbed = new EmbedBuilder()

      .setAuthor({
        name: `@${this.client.user.username}!`,
        iconURL: this.client.user.displayAvatarURL(),
        url: this.client.config.guildLinks.jardim.url,
      })
      .setThumbnail(this.client.user.displayAvatarURL())

      .setColor(this.client.config.embedColors.default)
      .setTitle(`Lista de comandos - ${categoriesAssets[category].name}`)
      .setDescription(
        `Aqui está a lista de comandos da categoria de comandos **${categoriesAssets[category].name}**!` +
          `\n\nLembre-se meus comandos funcionam de duas formas, sendo elas:\n- Por **prefixo**: \`${this.client.config.globalPrefix}\`.\n- Por **barra**: \`/\`.` +
          `\nOs argumentos são divididos dessa forma:\n- **Obrigatório**: \`<argumento: tipo>\`.\n- **Opcional**: \`[argumento: tipo]\`.` +
          `\n\n-# Aqui estão os comandos da categoria: `,
      )

      .setTimestamp()
      .setFooter({
        text: `@${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    categoryCommands.forEach((command) => {
      let usage = "[nenhum argumento]";
      if (command.commandUsage.length > 0) {
        usage = `${this.client.config.globalPrefix}${
          command.commandName
        } ${command.commandUsage
          .map(
            (arg) =>
              `${arg.required ? "<" : "["}${arg.name}: ${arg.type}${
                arg.required ? ">" : "]"
              }`,
          )
          .join(" ")}`;
      }

      categoryEmbed.addFields({
        name: `\`${this.client.config.globalPrefix}\`${command.commandName}`,
        value: `\`${usage}\``,
        inline: true,
      });
    });

    await interaction.update({
      embeds: [categoryEmbed],
    });
  }
}
