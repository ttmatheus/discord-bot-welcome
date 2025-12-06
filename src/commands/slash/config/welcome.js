import { CommandBase } from "../../../structures/commands.js";
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
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
        .setName("boas-vindas")
        .setDescription("Configura o sistema de boas-vindas e saída.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((option) =>
          option
            .setName("canal_entrada")
            .setDescription(
              "O canal onde as mensagens de boas-vindas serão enviadas.",
            )
            .addChannelTypes(ChannelType.GuildText),
        )
        .addStringOption((option) =>
          option
            .setName("mensagem_entrada")
            .setDescription(
              "A mensagem de boas-vindas (texto ou JSON para embed). Placeholders: {user}, {server}, {memberCount}",
            ),
        )
        .addChannelOption((option) =>
          option
            .setName("canal_saida")
            .setDescription(
              "O canal onde as mensagens de saída serão enviadas.",
            )
            .addChannelTypes(ChannelType.GuildText),
        )
        .addStringOption((option) =>
          option
            .setName("mensagem_saida")
            .setDescription(
              "A mensagem de saída (texto ou JSON para embed). Placeholders: {user}, {server}, {memberCount}",
            ),
        )
        .addStringOption((option) =>
          option
            .setName("modo_envio")
            .setDescription("Onde a mensagem de boas-vindas deve ser enviada.")
            .addChoices(
              { name: "Canal", value: "Canal" },
              { name: "Privado", value: "Privado" },
              { name: "Ambos", value: "Ambos" },
            ),
        )
        .setContexts(["Guild"]),
      commandName: "boas-vindas",
      commandAliases: ["welcome", "setwelcome"],
      commandDescription: "Configura o sistema de boas-vindas e saída.",
      commandCategory: "config",
      commandCooldown: 3,
    });
  }

  async execute(interaction) {
    const welcomeChannel = interaction.options.getChannel("canal_entrada");
    const welcomeMessage = interaction.options.getString("mensagem_entrada");
    const leaveChannel = interaction.options.getChannel("canal_saida");
    const leaveMessage = interaction.options.getString("mensagem_saida");
    const sendMode = interaction.options.getString("modo_envio");

    if (
      !welcomeChannel &&
      !welcomeMessage &&
      !leaveChannel &&
      !leaveMessage &&
      !sendMode
    ) {
      return interaction.reply({
        content:
          "❌ Você precisa fornecer pelo menos uma configuração para alterar.",
        flags: [MessageFlags.Ephemeral],
      });
    }

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

    let updates = [];

    if (welcomeChannel) {
      currentConfig.welcomeSystem.welcomeChannel = welcomeChannel.id;
      updates.push(`- ✅ Canal de entrada definido para ${welcomeChannel}`);
    }
    if (welcomeMessage) {
      currentConfig.welcomeSystem.welcomeMessage = welcomeMessage;
      updates.push(`- ✅ Mensagem de entrada atualizada.`);
    }
    if (leaveChannel) {
      currentConfig.welcomeSystem.leaveChannel = leaveChannel.id;
      updates.push(`- ✅ Canal de saída definido para ${leaveChannel}`);
    }
    if (leaveMessage) {
      currentConfig.welcomeSystem.leaveMessage = leaveMessage;
      updates.push(`- ✅ Mensagem de saída atualizada.`);
    }
    if (sendMode) {
      currentConfig.welcomeSystem.mode = sendMode;
      updates.push(`- ✅ Modo de envio definido para **${sendMode}**.`);
    }

    try {
      fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2));

      this.client.config = currentConfig;

      await interaction.reply({
        content: `## Configurações atualizadas:\n>>> ${updates.join("\n")}`,
        flags: [MessageFlags.Ephemeral],
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: `❌ Ocorreu um erro ao salvar as configurações: ${err.message}`,
        flags: [MessageFlags.Ephemeral],
      });
    }
  }
}
