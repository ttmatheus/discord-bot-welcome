import { CommandBase } from "../../../structures/commands.js";
import { EmbedBuilder } from "discord.js";

export default class CooldownCommand extends CommandBase {
  constructor(client) {
    super(client, {
      commandName: "tempos",
      commandAliases: ["cd", "cds", "cooldowns"],
      commandDescription:
        "Veja os tempos de espera de todos os comandos de coleta!",
      commandCategory: "economy",
      commandCooldown: 3,
    });
  }

  async execute(message, args) {
    const user = await this.client.database.getOrUpdateUser(message.author.id);

    let times = [];

    times.push(this.checkCooldownTime("dailyCooldown", user));
    times.push(this.checkCooldownTime("weeklyCooldown", user));
    times.push(this.checkCooldownTime("workCooldown", user));

    const embed = new EmbedBuilder()

      .setColor(this.client.config.embedColors.green)
      .setTimestamp()
      .setFooter({
        text: `@${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
      })

      .setTitle("⏰ Tempos de espera")
      .setDescription(
        `${message.author.toString()}, aqui estão os seus tempos de espera:`,
      )
      .setFields([
        { name: "Recompensas", value: times.join("\n"), inline: false },
      ]);

    return message.reply({
      content: message.author.toString(),
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
