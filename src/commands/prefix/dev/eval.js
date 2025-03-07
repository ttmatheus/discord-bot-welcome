import { CommandBase } from "../../../structures/commands.js";

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";

import util from "util";

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      commandName: "eval",
      commandAliases: ["ev"],
      commandDescription: "Executa código em JavaScript de forma segura.",
      commandCategory: "development",
      commandUsage: [
        {
          name: "código",
          type: "string",
          required: true,
        },
      ],
      commandCooldown: 0,
      userPermissions: ["Dev"],
    });
  }

  async execute(message, args) {
    const code = args.join(" ");
    const start = Date.now();

    if (!code)
      return message.reply({
        content: `❌${message.author}, você não forneceu nenhum código...`,
      });

    try {
      let result = await eval(`(async () => { ${code} })()`);
      result =
        typeof result === "object"
          ? util.inspect(result, { depth: 2 })
          : String(result);

      if (result.length > 3900) {
        const buffer = Buffer.from(result, "utf-8");
        const file = new AttachmentBuilder(buffer, { name: "eval_result.js" });

        return message.reply({
          content: `✅ ${
            message.author
          }, execução bem-sucedida. \`(executado em: ${
            Date.now() - start
          }ms)\``,
          files: [file],
        });
      }

      const embed = new EmbedBuilder()

        .setColor(this.client.config.embedColors.green)
        .setTitle("✅ Execução bem-sucedida.")
        .setDescription(`\`\`\`js\n${result}\`\`\``)

        .setTimestamp()
        .setFooter({
          text: `Executado em: ${Date.now() - start}ms - @${
            message.author.username
          }`,
          iconURL: message.author.displayAvatarURL(),
        });

      await message.reply({
        content: message.author.toString(),
        embeds: [embed],
      });
    } catch (error) {
      const embed = new EmbedBuilder()

        .setColor(this.client.config.embedColors.red)
        .setTitle("❌ Erro na execução.")
        .setDescription(`\`\`\`js\n${error}\`\`\``)

        .setTimestamp()
        .setFooter({
          text: `Executado em: ${Date.now() - start}ms - @${
            message.author.username
          }`,
          iconURL: message.author.displayAvatarURL(),
        });

      await message.reply({
        content: message.author.toString(),
        embeds: [embed],
      });
    }
  }
}
