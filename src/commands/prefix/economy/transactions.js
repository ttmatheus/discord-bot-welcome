import { CommandBase } from "../../../structures/commands.js";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export default class TransactionsCommand extends CommandBase {
  constructor(client) {
    super(client, {
      commandName: "transações",
      commandAliases: ["transactions", "tr", "trs", "ranking", "lb", "top"],
      commandDescription: "Mostra o histórico de transações de um usuário.",
      commandCategory: "economy",
      commandCooldown: 5,
      commandUsage: [
        {
          name: "página",
          type: "number",
          required: false,
        },
        {
          name: "usuário",
          type: "user",
          required: false,
        },
      ],
    });
  }

  async execute(message, args) {
    try {
      let target, page;

      if (args.length >= 2) {
        target = await this.client.clientUtils.findUser(args[0], message, true);
        page = parseInt(args[1]) || 1;
      } else {
        if (!isNaN(args[0])) {
          target = message.author;
          page = parseInt(args[0]) || 1;
        } else {
          target = await this.client.clientUtils.findUser(
            args[0],
            message,
            true,
          );
          page = 1;
        }
      }

      const limit = 10;
      const totalTransactions =
        await this.client.database.transactions.getTransactionCount(target.id);
      const maxPages = Math.ceil(totalTransactions / limit) || 1;

      if (page < 1 || page > maxPages)
        return message.reply({
          content: `❌ ${message.author}, página inválida. As páginas devem estar entre **1** e **${maxPages}**.`,
        });

      const transactions = await this.fetchTransactions(target.id, page, limit);
      const embed = await this.createEmbed(
        transactions,
        page,
        maxPages,
        totalTransactions,
        target,
      );
      const row = this.createNavigationButtons(page, maxPages);

      const msg = await message.reply({ embeds: [embed], components: [row] });
      this.handleCollector(
        msg,
        target,
        page,
        maxPages,
        totalTransactions,
        limit,
      );
    } catch (error) {
      this.client.logger.error("Erro no comando transações:", error);
      message.reply({
        content: `❌ ${message.author}, ocorreu um erro ao processar o comando.`,
      });
    }
  }

  async fetchTransactions(userId, page, limit) {
    try {
      return await this.client.database.transactions.getTransactions(
        userId,
        page,
        limit,
      );
    } catch (error) {
      this.client.logger.error("Erro ao buscar transações:", error);
      return [];
    }
  }

  async createEmbed(transactions, page, maxPages, totalTransactions, target) {
    let description = `-# Página: **${page}/${maxPages}** | **${this.client.utils.formatNumberToLocale(
      totalTransactions,
    )}** transações.\n\n`;

    if (transactions.length === 0) {
      description += "-# Nenhuma transação encontrada.";
    } else {
      transactions.forEach((tx) => {
        const txMessage =
          this.client.database.transactions.transactionDisplayText(tx, target);
        description += `> ${txMessage}\n`;
      });
    }

    return new EmbedBuilder()
      .setTitle(`📜 Histórico de transações de \`@${target.username}\``)
      .setDescription(description)
      .setColor(this.client.config.embedColors.green)
      .setTimestamp()
      .setFooter({
        text: `@${target.username}`,
        iconURL: target.displayAvatarURL(),
      });
  }

  createNavigationButtons(page, maxPages) {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("previous_page")
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1),
      new ButtonBuilder()
        .setCustomId("next_page")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === maxPages),
    );
  }

  async handleCollector(
    msg,
    target,
    currentPage,
    maxPages,
    totalTransactions,
    limit,
  ) {
    const collector = msg.createMessageComponentCollector({
      filter: (i) =>
        i.user.id === msg.author?.id ||
        i.user.id === target.id ||
        i.user.id === msg.interaction?.user.id,
      time: 60_000,
    });

    collector.on("collect", async (interaction) => {
      try {
        let newPage = currentPage;
        if (interaction.customId === "previous_page") {
          newPage = Math.max(1, currentPage - 1);
        } else if (interaction.customId === "next_page") {
          newPage = Math.min(maxPages, currentPage + 1);
        }
        if (newPage === currentPage) return;

        const newTransactions = await this.fetchTransactions(
          target.id,
          newPage,
          limit,
        );
        const newEmbed = await this.createEmbed(
          newTransactions,
          newPage,
          maxPages,
          totalTransactions,
          target,
        );
        const newRow = this.createNavigationButtons(newPage, maxPages);

        await interaction.update({ embeds: [newEmbed], components: [newRow] });
        currentPage = newPage;
      } catch (error) {
        this.client.logger.error(
          "Erro na interação do histórico de transações:",
          error,
        );
      }
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch((err) => {
        this.client.logger.error("Erro ao editar mensagem de transações:", err);
      });
    });
  }
}
