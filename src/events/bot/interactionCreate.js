import { EventListener } from "../../structures/events.js";

import { MessageFlags } from "discord.js";

export default class Event extends EventListener {
  constructor(client) {
    super(client, {
      eventName: "interactionCreate",
    });
  }

  async execute(interaction) {
    let interactionKey = interaction.customId || interaction.commandName;

    if (interaction.customId?.includes("_"))
      interactionKey = interaction.customId.split("_")[0];

    if (interaction.isCommand()) {
      const interactionHandler = this.client.slashCommands.get(interactionKey);
      if (!interactionHandler) return;

      const userData = await this.client.database.getOrUpdateUser(
        interaction.user.id,
      );
      const userPerms =
        this.client.config.developerPermissions[interaction.user.id] || [];
      if (
        interactionHandler.userPermissions.length &&
        !userPerms.some((role) =>
          interactionHandler.userPermissions?.includes(role),
        )
      )
        return interaction.reply({
          content: `❌ ${interaction.user}, você não tem permissão para usar este comando!`,
          flags: MessageFlags.Ephemeral,
        });

      if (userData.userBanishmentData.banTimestamp > 0) {
        return interaction.reply({
          content: `❌ ${
            interaction.user
          }, você está proíbido de utilizar meus comandos!\n-# - Data do banimento: <t:${Math.floor(
            userData.userBanishmentData.banTimestamp / 1000,
          )}> (<t:${Math.floor(
            userData.userBanishmentData.banTimestamp / 1000,
          )}:R>)\n-# - Razão do banimento: \`${
            userData.userBanishmentData.banReason
          }\``,
          flags: MessageFlags.Ephemeral,
        });
      }

      if (
        interactionHandler.commandDisabled &&
        !userPerms.some((role) => ["Dev", "Admin"].includes(role))
      ) {
        return interaction.reply({
          content: `❕ ${interaction.user}, você não tem permissão para usar este comando, ou ele está desativado.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      if (
        interactionHandler.memberPermissions.length &&
        !interaction.member.permissions.has(
          interactionHandler.memberPermissions,
        )
      ) {
        return interaction.reply({
          content: `❌ ${interaction.member}, você não tem permissões suficientes para usar este comando!`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const commandCooldown = await this.userCommandsCooldown(
        interaction,
        interactionHandler,
      );
      if (commandCooldown)
        return interaction.reply({
          content: commandCooldown,
          flags: MessageFlags.Ephemeral,
        });

      interactionHandler.execute(interaction, {
        customId: interaction.customId,
      });
    } else {
      const interactionHandler =
        this.client.interactionFeatures.get(interactionKey);
      if (!interactionHandler) return;

      return interactionHandler.execute(interaction, {
        customId: interaction.customId,
      });
    }
  }

  async userCommandsCooldown(interaction, command) {
    const now = Date.now();
    const cooldownData = this.client.userCommandsCooldown.get(
      interaction.user.id,
    ) ?? { warns: 0, time: 0 };
    if (
      this.client.config.developerPermissions[interaction.user.id]?.some(
        (perm) => ["Admin", "Dev"].includes(perm),
      )
    )
      return false;

    if (cooldownData.time >= now) {
      cooldownData.warns++;
      cooldownData.time +=
        command.commandCooldown * Math.pow(1.25, cooldownData.warns - 1);

      this.client.userCommandsCooldown.set(interaction.user.id, cooldownData);
      return `⏳ ${
        interaction.user
      }, aguarde **${this.client.utils.formatTimeString(
        cooldownData.time,
        2,
      )}** antes de usar outro comando. \`(AVISO: ${cooldownData.warns})\``;
    }

    this.client.userCommandsCooldown.set(interaction.user.id, {
      warns: 0,
      time: now + command.commandCooldown,
    });
    return false;
  }
}
