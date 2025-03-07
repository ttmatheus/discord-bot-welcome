import { CommandBase } from "../../../structures/commands.js";

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
  MessageFlags,
} from "discord.js";

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      slashCommandData: new SlashCommandBuilder()
        .setName("saldo")
        .setDescription("Mostra o seu saldo com a sua posição no placar")
        .setNameLocalizations({ "pt-BR": "saldo", "en-US": "balance" })
        .setDescriptionLocalizations({
          "pt-BR": "Mostra o seu saldo com a sua posição no placar.",
          "en-US": "Shows your balance with your position on the scoreboard.",
        })
        .setContexts(["Guild"])
        .addUserOption((option) =>
          option
            .setName("usuário")
            .setDescription("Veja o saldo de outro usuário")
            .setNameLocalizations({
              "pt-BR": "usuário",
              "en-US": "user",
            })
            .setDescriptionLocalizations({
              "pt-BR": "Veja o saldo de outro usuário.",
              "en-US": "See the balance of another user.",
            })
            .setRequired(false),
        ),
      commandName: "saldo",
      commandAliases: ["balance", "bal", "atm", "moedas"],
      commandDescription: "Mostra o seu saldo com a sua posição no placar.",
      commandCategory: "economy",
      commandUsage: [
        {
          name: "usuário",
          type: "string",
          required: false,
        },
      ],
      commandCooldown: 1,
    });
  }

  async execute(interaction) {
    const user = interaction.options.getUser("usuário") || interaction.user;
    const data = await this.client.database.getOrUpdateUser(user.id);
    const position = await this.client.database.users.model.countDocuments({
      userBalance: {
        $gt: data.userBalance,
      },
    });

    return interaction.reply({
      content: `${interaction.user}, ${
        user.id !== interaction.user.id
          ? `o usuário \`@${user.username}\` \`(${user.id}\`)`
          : `você`
      } tem um total de ${
        this.client.economy.emojis.money
      } **${data.userBalance.toLocaleString()} ${
        this.client.economy.names.money
      }** no saldo ${
        data.userBalance === 0
          ? `e não está classificado no placar...`
          : `e está em **#${position + 1}** no placar dos usuários com mais ${
              this.client.economy.names.money
            }!`
      }`,
    });
  }
}
