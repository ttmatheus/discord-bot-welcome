import { CommandBase } from "../../../structures/commands.js";

import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  AttachmentBuilder,
} from "discord.js";

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      commandName: "ajuda",
      commandAliases: ["help", "comandos", "commands"],
      commandDescription:
        "Mostra a lista de comandos da aplicação e como utilziar os comandos.",
      commandCategory: "miscellaneous",
      commandCooldown: 4,
    });
  }

  async execute(message, args) {
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
        text: `@${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
      });

    const selectMenu = new StringSelectMenuBuilder()

      .setCustomId("help_category_select_" + message.author.id)
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
    const msg = await message.reply({
      embeds: [embed],
      components: [row],
      files: [attachment],
    });

    setTimeout(() => {
      return msg
        .edit({
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
