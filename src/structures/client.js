import "dotenv/config";

import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";

import { Loaders } from "../handler/loaders.js";
import { Logger } from "../handler/logger.js";
import { AntiCrash } from "../handler/anticrash.js";
import { UtilFunctions } from "../functions/util/functions.js";
import { ClientUtilFunctions } from "../functions/private/main.js";

import config from "../config/config.json" with { type: "json" };

class DiscordBot extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
      ],
      partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.User,
      ],
    });

    this.slashCommands = new Collection();

    this.interactionFeatures = new Collection();
    this.userCommandsCooldown = new Collection();

    this.config = config;
    this.utils = new UtilFunctions();
    this.clientUtils = new ClientUtilFunctions(this);

    this.loaders = new Loaders(this);
    this.logger = new Logger(this);
    this.anticrash = new AntiCrash(this);
  }

  async start() {
    await this.loaders.loadEvents();
    await this.loaders.loadCommands();
    await this.loaders.loadInteractions();

    await this.anticrash.initialize();

    this.login(process.env.CLIENT_TOKEN);
  }
}

export default DiscordBot;
