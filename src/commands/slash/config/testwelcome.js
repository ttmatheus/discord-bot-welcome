import { CommandBase } from "../../../structures/commands.js";
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      slashCommandData: new SlashCommandBuilder()
        .setName("testar-boas-vindas")
        .setDescription("Testa a configuração atual de boas-vindas.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(["Guild"]),
      commandName: "testar-boas-vindas",
      commandAliases: ["testwelcome"],
      commandDescription: "Testa a configuração atual de boas-vindas.",
      commandCategory: "config",
      commandCooldown: 5,
    });
  }

  async execute(interaction) {
    const configPath = path.resolve(__dirname, "../../../config/config.json");
    let currentConfig;

    try {
      const fileData = fs.readFileSync(configPath, "utf8");
      currentConfig = JSON.parse(fileData);
    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "❌ Erro ao ler o arquivo de configuração.",
        flags: [MessageFlags.Ephemeral],
      });
    }

    const { welcomeSystem } = currentConfig;

    if (
      !welcomeSystem ||
      !welcomeSystem.welcomeChannel ||
      !welcomeSystem.welcomeMessage
    ) {
      return interaction.reply({
        content:
          "⚠️ Não foi possível testar: Configuração de boas-vindas incompleta.",
        flags: [MessageFlags.Ephemeral],
      });
    }

    const { mode, welcomeChannel, welcomeMessage } = welcomeSystem;
    const channel = interaction.guild.channels.cache.get(welcomeChannel);

    if (!channel) {
      return interaction.reply({
        content:
          "⚠️ Não foi possível testar: Canal de boas-vindas não encontrado.",
        flags: [MessageFlags.Ephemeral],
      });
    }

    await interaction.reply({
      content: `🧪 Testando boas-vindas...`,
      flags: [MessageFlags.Ephemeral],
    });

    let messageContent = welcomeMessage
      .replace(/{user}/g, fakeMember.user)
      .replace(/{server}/g, fakeMember.guild.name)
      .replace(/{memberCount}/g, fakeMember.guild.memberCount);

    let payload = {};
    if (messageContent.trim().startsWith("{")) {
      try {
        const embedData = JSON.parse(messageContent);
        if (embedData.embeds || embedData.content) {
          payload = embedData;
        } else {
          payload = { embeds: [embedData] };
        }
      } catch (e) {
        payload = { content: messageContent };
      }
    } else {
      payload = { content: messageContent };
    }

    const targetMode = mode || "Canal";
    let log = [];

    if (targetMode === "Canal" || targetMode === "Ambos") {
      try {
        await channel.send(payload);
        log.push(`✅ Mensagem enviada no canal ${channel}`);
      } catch (e) {
        log.push(`❌ Falha ao enviar no canal: ${e.message}`);
      }
    }

    if (targetMode === "Privado" || targetMode === "Ambos") {
      try {
        await interaction.member.send(payload);
        log.push(
          `✅ ${interaction.member.toString()}, mensagem enviada no seu privado`,
        );
      } catch (e) {
        log.push(
          `❌ ${interaction.member.toString()}, falha ao enviar privada: ${
            e.message
          }`,
        );
      }
    }

    await interaction.editReply({
      content: `## Resultado do Teste\n>>> ${log.join("\n")}`,
    });
  }
}
