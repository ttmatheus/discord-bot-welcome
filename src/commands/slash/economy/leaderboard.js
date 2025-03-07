import { CommandBase } from "../../../structures/commands.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      slashCommandData: new SlashCommandBuilder()
        .setName("placar")
        .setDescription("Mostra o placar dos usuários mais ricos.")
        .setNameLocalizations({ "pt-BR": "placar", "en-US": "leaderboard" })
        .setDescriptionLocalizations({
          "pt-BR": "Mostra o placar dos usuários mais ricos.",
          "en-US": "Shows the score of the richest users.",
        })
        .setContexts(["Guild"])
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
            .setMaxValue(client.economy.limiters.leaderboard.limit)
            .setRequired(false),
        ),
      commandName: "placar",
      commandAliases: ["leaderboard", "ranking", "lb", "top"],
      commandDescription: "Mostra o placar dos usuários mais ricos.",
      commandCategory: "economy",
      commandUsage: [
        {
          name: "página",
          type: "number",
          required: false,
        },
      ],
      commandCooldown: 5,
    });
  }

  async execute(interaction) {
    try {
      const page = parseInt(interaction.options.getInteger("página")) || 1;
      const limit = this.client.economy.limiters.leaderboard.limit;

      const totalUsers =
        await this.client.database.users.model.countDocuments();
      if (totalUsers === 0) {
        return interaction.reply({
          content: `❌ ${interaction.user}, não há usuários registrados no sistema.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const maxPages = Math.ceil(totalUsers / limit) || 1;

      if (page < 1 || page > maxPages) {
        return interaction.reply({
          content: `❌ ${interaction.user}, página inválida. As páginas devem estar entre **1** e **${maxPages}**.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const leaderboardData = await this.fetchLeaderboardData(page);
      const embed = await this.createLeaderboardEmbed(
        leaderboardData,
        page,
        maxPages,
        interaction.user,
      );
      const row = this.createNavigationButtons(page, maxPages);

      const msg = await interaction.reply({
        embeds: [embed],
        components: [row],
      });
      this.handleButtonInteractions(msg, interaction.user);
    } catch (error) {
      this.client.logger.error("Erro no comando placar:", error);

      return interaction.reply({
        content: `❌ ${interaction.user}, ocorreu um erro ao processar o comando.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  async fetchLeaderboardData(page) {
    try {
      const limit = this.client.economy.limiters.leaderboard.limit;
      const skip = (page - 1) * limit;

      return await this.client.database.users.model
        .find()
        .sort({ userBalance: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      this.client.logger.error("Erro ao buscar dados do placar:", error);
      return [];
    }
  }

  async createLeaderboardEmbed(leaderboard, page, maxPages, author) {
    const embed = new EmbedBuilder()

      .setTitle(
        `${this.client.economy.emojis.money} Placar de ${this.client.economy.names.money} (${page}/${maxPages})`,
      )

      .setColor(this.client.config.embedColors.green)
      .setFooter({
        text: `@${author.username}`,
        iconURL: author.displayAvatarURL(),
      })
      .setTimestamp();

    if (leaderboard.length === 0) {
      embed.setDescription("Nenhum usuário encontrado nesta página.");
      return embed;
    }

    const userFetchPromises = leaderboard.map((user) =>
      this.client.users.fetch(user.userId).catch(() => null),
    );
    const users = await Promise.all(userFetchPromises);

    const entries = leaderboard.map((user, index) => {
      const rank =
        (page - 1) * this.client.economy.limiters.leaderboard.limit + index + 1;
      const discordUser = users[index];
      const balance = this.client.utils.formatNumberToLocale(user.userBalance);

      return {
        name: `**#${rank}** - ${
          discordUser
            ? `@${discordUser.username} \`(${discordUser.id})\``
            : "Usuário desconhecido..."
        }`,
        value: `- ${this.client.economy.emojis.money} **${balance} ${this.client.economy.names.money}**`,
        inline: false,
      };
    });

    embed.setFields(
      entries.map((entry, index) => ({
        name: `${entry.name}`,
        value: entry.value,
        inline: false,
      })),
    );
    embed.setDescription(`Exibindo usuários da página **${page}**.`);
    return embed;
  }

  createNavigationButtons(page, maxPages) {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("leaderboard_start")
        .setEmoji("⏪")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1),
      new ButtonBuilder()
        .setCustomId("leaderboard_prev")
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1),
      new ButtonBuilder()
        .setCustomId("leaderboard_refresh")
        .setEmoji("🔄")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("leaderboard_next")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === maxPages),
      new ButtonBuilder()
        .setCustomId("leaderboard_end")
        .setEmoji("⏩")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === maxPages),
    );
  }

  async handleButtonInteractions(msg, author) {
    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === author.id,
      time: 120_000,
    });

    collector.on("collect", async (interaction) => {
      try {
        const currentPage =
          parseInt(
            interaction.message.embeds[0].title.match(/\((\d+)\//)?.[1],
          ) || 1;
        let newPage = currentPage;

        switch (interaction.customId) {
          case "leaderboard_start":
            newPage = 1;
            break;
          case "leaderboard_prev":
            newPage = Math.max(1, currentPage - 1);
            break;
          case "leaderboard_next":
            newPage = currentPage + 1;
            break;
          case "leaderboard_end":
            const totalUsers =
              await this.client.database.users.model.countDocuments();
            const limit = this.client.economy.limiters.leaderboard.limit;
            newPage = Math.ceil(totalUsers / limit);
            break;
        }

        const totalUsers =
          await this.client.database.users.model.countDocuments();
        const limit = this.client.economy.limiters.leaderboard.limit;
        const maxPages = Math.ceil(totalUsers / limit) || 1;

        newPage = Math.min(Math.max(newPage, 1), maxPages);

        const leaderboardData = await this.fetchLeaderboardData(newPage);
        const newEmbed = await this.createLeaderboardEmbed(
          leaderboardData,
          newPage,
          maxPages,
          author,
        );
        const newRow = this.createNavigationButtons(newPage, maxPages);

        await interaction.update({ embeds: [newEmbed], components: [newRow] });
      } catch (error) {
        this.client.logger.error("Erro na interação do placar:", error);
      }
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
}
