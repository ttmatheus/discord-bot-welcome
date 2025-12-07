import { readdirSync } from "fs";
import { Collection } from "discord.js";

import colors from "colors";

export class Loaders {
  constructor(client) {
    this.client = client;
  }

  async loadEvents() {
    const eventFiles = readdirSync("./src/events/bot");

    for (const file of eventFiles) {
      let query = await import(`../events/bot/${file}`);
      let event = new query.default(this.client);

      this.client.on(event.eventName, (...args) => event.execute(...args));
      console.log(
        `[🔹 EVENTO]`.bgBlue +
          ` - Evento da aplicação "${event.eventName}" funcionando.`,
      );
    }
  }

  async loadCommands() {
    const categories = readdirSync("./src/commands/slash");
    for (const category of categories) {
      const commandFiles = readdirSync(`./src/commands/slash/${category}`);
      for (const file of commandFiles) {
        let query = await import(`../commands/slash/${category}/${file}`);
        let command = new query.default(this.client);

        this.client.slashCommands.set(command.slashCommandData.name, command);
        console.log(
          `[✅ COMANDO - SLASH]`.bgGreen +
            ` - Comando carregado "${command.slashCommandData.name}".`,
        );
      }
    }
  }

  async loadInteractions() {
    const types = readdirSync("./src/interactions", { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const type of types) {
      const files = readdirSync(`./src/interactions/${type}`);

      for (const file of files) {
        const interaction = await import(`../interactions/${type}/${file}`);
        const instance = new interaction.default(this.client);

        this.client.interactionFeatures.set(instance.name, instance);
        console.log(
          `[⚡ INTERAÇÃO - ${type.toUpperCase()}]`.bgBlue +
            ` - Carregado o recurso de interação "${instance.name}".`,
        );
      }
    }
  }

  async registerSlashCommands() {
    const commands = [...this.client.slashCommands.values()].map(
      (cmd) => cmd.slashCommandData,
    );
    const guilds = this.client.config.slashCommands.guilds || [];

    if (this.client.config.slashCommands.register) {
      if (guilds.length > 0) {
        for (const guildId of guilds) {
          const guild = await this.client.guilds
            .fetch(guildId)
            .catch(() => null);
          if (!guild) continue;

          await guild.commands.set(commands);
          return console.log(
            `[🌍 APLICAÇÃO]`.bgWhite +
              ` - Comandos de barra registrados no servidor: "${guildId}".`,
          );
        }
      } else {
        await this.client.application.commands.set(commands);
        return console.log(
          `[🌎 APLICAÇÃO]`.bgWhite +
            ` - Comandos de barra registrados globalmente.`,
        );
      }
    } else {
      if (guilds.length > 0) {
        for (const guildId of guilds) {
          const guild = await this.client.guilds
            .fetch(guildId)
            .catch(() => null);
          if (!guild) continue;

          await guild.commands.set([]);
          return console.log(
            `[🌍 APLICAÇÃO]`.bgWhite +
              ` - Comandos de barra desativados no servidor: "${guildId}".`,
          );
        }
      } else {
        await this.client.application.commands.set([]);
        return console.log(
          `[🌍 APLICAÇÃO]`.bgWhite +
            ` - Comandos de barra desativados globalmente.`,
        );
      }
    }
  }
}
