export class CommandBase {
  constructor(client, options) {
    this.client = client;
    this.slashCommandData = options.slashCommandData;

    this.commandName = options.commandName;
    this.commandAliases = options.commandAliases || [];
    this.commandDescription =
      options.commandDescription ||
      "Nenhuma descrição foi adicionada à este comando.";
    this.commandCategory = options.commandCategory || "miscellaneous";
    this.commandUsage = options.commandUsage || [];
    this.commandCooldown = options.commandCooldown * 1000 || 1500;
    this.commandDisabled = options.commandDisabled || false;

    this.userPermissions = options.userPermissions || [];
    this.userPremium = options.userPremium || false;
    this.guildPremium = options.guildPremium || false;

    this.memberPermissions = options.memberPermissions || [];
  }
}
