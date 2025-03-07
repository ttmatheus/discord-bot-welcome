import { CommandBase } from "../../../structures/commands.js";

import { PermissionFlagsBits } from "discord.js";

export default class Command extends CommandBase {
  constructor(client) {
    super(client, {
      commandName: "ping",
      commandAliases: ["latency", "latencia", "latência"],
      commandDescription: "Mostra a latência da aplicação.",
      commandCategory: "informations",
      commandCooldown: 1,
    });
  }

  async execute(message, args) {
    const startTime = Date.now();

    const botMessage = await message.reply({
      content: `${message.author}, calculando a latência da aplicação...`,
    });

    let dbPing = Date.now();
    await this.client.database.getOrUpdateUser(message.author.id);
    dbPing = Date.now() - dbPing;

    const responseLatency = Date.now() - startTime;

    return botMessage
      .edit({
        content: `${message.author}, informações sobre a latência:\n-# - 🏓 Gateway: \`${this.client.ws.ping}ms\`\n-# - ⏰ Resposta: \`${responseLatency}ms\`\n-# - 📦 Banco de dados: \`${dbPing}ms\``,
      })
      .catch((err) => {
        this.client.logger.error(
          "Não consegui editar a mensagem do comando de latência.",
          err,
        );
      });
  }
}
