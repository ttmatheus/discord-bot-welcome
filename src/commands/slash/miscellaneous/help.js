import { CommandBase } from "../../../structures/commands.js";
import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  AttachmentBuilder,
  SlashCommandBuilder,
} from "discord.js";

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      slashCommandData: new SlashCommandBuilder()
        .setName("ajuda")
        .setDescription(
          "Mostra a lista de comandos da aplicação e como utilziar os comandos.",
        )
        .setContexts(["Guild"]),
      commandName: "ajuda",
      commandDescription: "Mostra todos os comandos disponíveis.",
      commandAliases: ["help", "comandos", "commands"],
      commandCategory: "miscellaneous",
      commandCooldown: 4,
    });
  }

  async execute(interaction) {
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
      if (command.commandCategory !== "development") {
        if (!categories.has(command.commandCategory)) {
          categories.set(command.commandCategory, []);
        }
        categories.get(command.commandCategory).push(command);
      }
    }

    const embed = new EmbedBuilder()

      .setAuthor({
        name: `@${this.client.user.username}!`,
        iconURL: this.client.user.displayAvatarURL(),
        url: this.client.config.guildLinks.guild.url,
      })
      .setThumbnail(this.client.user.displayAvatarURL())

      .setTitle("Ajuda - Lista de comandos")
      .setDescription(
        `Olá, eu sou o ${this.client.user.username}! E estou aqui para te ajudar a utilizar meus comandos.` +
          `\n\nPara utilizar um comando você deve utilizar a barra \`/\` seguida do nome do comando.` +
          `\n\n📌 **Como usar:**\n- Digite \`/\` e selecione o comando desejado na lista que aparecer.` +
          `\n- Alguns comandos possuem argumentos obrigatórios ou opcionais. O Discord irá te guiar!` +
          `\n\n-# Abaixo estão minhas listas de comandos separados por categoria, clique e escolha quais categorias deseja visualizar os comandos.`,
      )

      .setColor(this.client.config.embedColors.default)
      .setTimestamp()
      .setFooter({
        text: `@${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    const selectMenu = new StringSelectMenuBuilder()

      .setCustomId(`help_category_select_${interaction.user.id}`)
      .setPlaceholder("Selecione uma categoria...");

    categories.forEach((categoryCommands, category) => {
      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(categoriesAssets[category].name)
          .setValue(category)
          .setEmoji(categoriesAssets[category].emoji)
          .setDescription(categoriesAssets[category].description),
      );
    });

    const row = new ActionRowBuilder().addComponents(selectMenu);
    await interaction.reply({
      embeds: [embed],
      components: [row],
    });

    setTimeout(() => {
      interaction
        .editReply({
          components: [],
        })
        .catch((err) => {
          this.client.logger.error(
            "Não consegui editar a mensagem do comando de ajuda.",
            err,
          );
        });
    }, 60000);
  }
}
