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
        .setNameLocalizations({ "pt-BR": "ajuda", "en-US": "help" })
        .setDescriptionLocalizations({
          "pt-BR":
            "Mostra a lista de comandos da aplicação e como utilziar os comandos.",
          "en-US":
            "Shows the list of application commands and how to use the commands.",
        })
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
        description:
          "Comandos diversos que podem te ajudar em algumas coisas...",
        emoji: "🍃",
      },
      informations: {
        name: "Informativos",
        description: "Comandos que te informam sobre algo específico...",
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
        url: this.client.config.guildLinks.jardim.url,
      })
      .setThumbnail(this.client.user.displayAvatarURL())

      .setTitle("Ajuda - Lista de comandos")
      .setDescription(
        `Olá, eu sou o ${this.client.user.username}! E estou aqui para te ajudar a utilizar meus comandos.` +
          `\n\nPara utilizar um comando você deve utilizar do seguinte modo: \`<prefixo><comando> [argumentos]\`. ` +
          `Você pode obter a lista de argumentos de um comando \`(caso tenha)\` utilizando o sub-comando \`<prefixo><comando> "info"\` \`(sem as áspas)\`.` +
          `\n\nAtualmente meus comandos funcionam de duas formas, sendo elas:\n- Por **prefixo**: \`${this.client.config.globalPrefix}\`.\n- Por **barra**: \`/\`.` +
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
