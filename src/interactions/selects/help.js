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

    const commands = this.client.slashCommands;
    const categories = new Map();
    const categoriesAssets = {
      miscellaneous: {
        name: "Diversos",
        description: "Comandos diversos que podem te ajudar em algumas coisas.",
        emoji: "🍃",
      },
      informations: {
        name: "Informativos",
        description: "Comandos que te informam sobre algo específico.",
        emoji: "❔",
      },
      config: {
        name: "Configurações",
        description: "Comandos que te permitem configurar a aplicação.",
        emoji: "⚙️",
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
        url: this.client.config.guildLinks.guild.url,
      })
      .setThumbnail(this.client.user.displayAvatarURL())

      .setColor(this.client.config.embedColors.default)
      .setTitle(`Lista de comandos - ${categoriesAssets[category].name}`)
      .setDescription(
        `Aqui está a lista de comandos da categoria de comandos **${categoriesAssets[category].name}**!` +
          `\n\nTodos os comandos abaixo devem ser utilizados com a **barra** \`/\`.` +
          `\nOs argumentos são divididos dessa forma:\n- **Obrigatório**: \`<argumento>\`.\n- **Opcional**: \`[argumento]\`.` +
          `\n\n-# Aqui estão os comandos da categoria: `,
      )

      .setTimestamp()
      .setFooter({
        text: `@${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    categoryCommands.forEach((command) => {
      let usage = "";
      if (
        command.slashCommandData &&
        command.slashCommandData.options &&
        command.slashCommandData.options.length > 0
      ) {
        usage = command.slashCommandData.options
          .map((opt) => {
            const name = opt.name;
            const required = opt.required;
            return required ? `<${name}>` : `[${name}]`;
          })
          .join(" ");
      } else {
        usage = "[nenhum argumento]";
      }

      categoryEmbed.addFields({
        name: `\`/${command.commandName}\``,
        value: `\`${
          usage ? `/${command.commandName} ${usage}` : `/${command.commandName}`
        }\`\n> ${command.commandDescription}`,
        inline: true,
      });
    });

    await interaction.update({
      embeds: [categoryEmbed],
    });
  }
}
