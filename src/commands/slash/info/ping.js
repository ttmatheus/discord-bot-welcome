import { CommandBase } from "../../../structures/commands.js";

import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      slashCommandData: new SlashCommandBuilder()
        .setName("latência")
        .setDescription("Mostra a latência da aplicação.")
        .setNameLocalizations({ "pt-BR": "latência", "en-US": "latency" })
        .setDescriptionLocalizations({
          "pt-BR": "Mostra a latência da aplicação.",
          "en-US": "Shows application latency.",
        })
        .setContexts(["Guild"]),
      commandName: "ping",
      commandAliases: ["latency", "latencia", "latência"],
      commandDescription: "Mostra a latência da aplicação.",
      commandCategory: "informations",
      commandCooldown: 1,
    });
  }

  async execute(interaction) {
    const startTime = Date.now();

    await interaction.reply({
      content: `${interaction.user}, calculando a latência da aplicação...`,
    });

    let dbPing = Date.now();
    await this.client.database.getOrUpdateUser(interaction.user.id);
    dbPing = Date.now() - dbPing;

    const responseLatency = Date.now() - startTime;

    return interaction
      .editReply({
        content: `${interaction.user}, informações sobre a latência:\n-# - 🏓 Gateway: \`${this.client.ws.ping}ms\`\n-# - ⏰ Resposta: \`${responseLatency}ms\`\n-# - 📦 Banco de dados: \`${dbPing}ms\``,
      })
      .catch((err) => {
        this.client.logger.error(
          "Não consegui editar a mensagem do comando de barra de latência.",
          err,
        );
      });
  }
}
