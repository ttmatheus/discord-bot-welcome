import { CommandBase } from "../../../structures/commands.js";

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default class CooldownCommand extends CommandBase {
  constructor(client) {
    super(client, {
      slashCommandData: new SlashCommandBuilder()
        .setName("tempos")
        .setDescription(
          "Veja os tempos de espera de todos os comandos de coleta.",
        )
        .setNameLocalizations({ "pt-BR": "tempos", "en-US": "cooldowns" })
        .setDescriptionLocalizations({
          "pt-BR": "Veja os tempos de espera de todos os comandos de coleta.",
          "en-US": "See the wait times for all collection commands.",
        })
        .setContexts(["Guild"]),
      commandName: "tempos",
      commandAliases: ["cd", "cds", "cooldowns"],
      commandDescription:
        "Veja os tempos de espera de todos os comandos de coleta!",
      commandCategory: "economy",
      commandCooldown: 3,
    });
  }

  async execute(interaction) {
    const user = await this.client.database.getOrUpdateUser(
      interaction.user.id,
    );

    let times = [];

    times.push(this.checkCooldownTime("dailyCooldown", user));
    times.push(this.checkCooldownTime("weeklyCooldown", user));
    times.push(this.checkCooldownTime("workCooldown", user));

    const embed = new EmbedBuilder()

      .setColor(this.client.config.embedColors.green)
      .setTimestamp()
      .setFooter({
        text: `@${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })

      .setTitle("⏰ Tempos de espera")
      .setDescription(
        `${interaction.user.toString()}, aqui estão os seus tempos de espera:`,
      )
      .setFields([
        { name: "Recompensas", value: times.join("\n"), inline: false },
      ]);

    return interaction.reply({
      content: interaction.user.toString(),
      embeds: [embed],
    });
  }

  checkCooldownTime(cooldownType, user) {
    const labels = {
      dailyCooldown: "Recompensa diária",
      weeklyCooldown: "Recompensa semanal",
      workCooldown: "Recompensa de trabalho",
    };

    if (user.userGlobalCooldowns[cooldownType] > Date.now()) {
      return `⏰ **${
        labels[cooldownType]
      }**: próxima coleta em \`${this.client.utils.formatTimeString(
        user.userGlobalCooldowns[cooldownType],
      )}\`!`;
    } else {
      return `✅ **${labels[cooldownType]}**: disponível!`;
    }
  }
}
