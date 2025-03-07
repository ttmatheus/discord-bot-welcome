import { CommandBase } from "../../../structures/commands.js";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  MessageFlags,
} from "discord.js";

export default class TransactionsCommand extends CommandBase {
  constructor(client) {
    super(client, {
      slashCommandData: new SlashCommandBuilder()
        .setName("transações")
        .setDescription("Mostra o histórico de transações.")
        .setNameLocalizations({
          "pt-BR": "transações",
          "en-US": "transactions",
        })
        .setDescriptionLocalizations({
          "pt-BR": "Mostra o histórico de transações.",
          "en-US": "Shows your transaction history.",
        })
        .setContexts(["Guild"])
        .addUserOption((option) =>
          option
            .setName("usuário")
            .setDescription(
              "O usuário cujas transações você deseja visualizar.",
            )
            .setNameLocalizations({ "pt-BR": "usuário", "en-US": "user" })
            .setDescriptionLocalizations({
              "pt-BR": "O usuário cujas transações você deseja visualizar.",
              "en-US": "The user whose transactions you want to view.",
            })
            .setRequired(false),
        )
        .addIntegerOption((option) =>
          option
            .setName("página")
            .setDescription("A página que você deseja visualizar.")
            .setNameLocalizations({ "pt-BR": "página", "en-US": "page" })
            .setDescriptionLocalizations({
              "pt-BR": "A página que você deseja visualizar.",
              "en-US": "The page you want to view.",
            })
            .setMinValue(1)
            .setRequired(false),
        ),
      commandName: "transações",
      commandAliases: ["transactions", "tr", "trs", "ranking", "lb", "top"],
      commandDescription: "Mostra o histórico de transações.",
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

  async execute(interaction) {
    try {
      const page = interaction.options.getInteger("página") || 1;
      const target = interaction.options.getUser("usuário") || interaction.user;
      const limit = 10;
      const totalTransactions =
        await this.client.database.transactions.getTransactionCount(target.id);
      const maxPages = Math.ceil(totalTransactions / limit) || 1;

      if (page < 1 || page > maxPages)
        return interaction.reply({
          content: `❌ ${interaction.user}, página inválida. As páginas devem estar entre **1** e **${maxPages}**.`,
          flags: MessageFlags.Ephemeral,
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

      const msg = await interaction.reply({
        embeds: [embed],
        components: [row],
      });
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
      interaction.reply({
        content: `❌ ${interaction.user}, ocorreu um erro ao processar o comando.`,
        ephemeral: true,
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
        i.user.id === interaction.user.id || i.user.id === target.id,
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
