import { EmbedBuilder } from "discord.js";

export default class GuildMemberAdd {
  constructor(client) {
    this.client = client;
    this.eventName = "guildMemberAdd";
  }

  async execute(member) {
    const { welcomeSystem } = this.client.config;

    if (
      !welcomeSystem ||
      !welcomeSystem.welcomeChannel ||
      !welcomeSystem.welcomeMessage
    )
      return;

    let messageContent = welcomeSystem.welcomeMessage
      .replace(/{user}/g, member.user)
      .replace(/{server}/g, member.guild.name)
      .replace(/{memberCount}/g, member.guild.memberCount);

    const mode = welcomeSystem.mode || "Canal";

    if (mode === "Canal" || mode === "Ambos") {
      const channel = member.guild.channels.cache.get(
        welcomeSystem.welcomeChannel,
      );
      if (channel) {
        try {
          if (messageContent.trim().startsWith("{")) {
            const embedData = JSON.parse(messageContent);
            if (embedData.embeds || embedData.content) {
              await channel.send(embedData);
            } else {
              await channel.send({ embeds: [embedData] });
            }
          } else {
            await channel.send({ content: messageContent });
          }
        } catch (e) {
          await channel.send({ content: messageContent });
        }
      }
    }

    if (mode === "Privado" || mode === "Ambos") {
      try {
        if (messageContent.trim().startsWith("{")) {
          const embedData = JSON.parse(messageContent);
          if (embedData.embeds || embedData.content) {
            await member.send(embedData);
          } else {
            await member.send({ embeds: [embedData] });
          }
        } else {
          await member.send({ content: messageContent });
        }
      } catch (e) {
        console.error(
          `Failed to send welcome DM to ${member.user.tag}: ${e.message}`,
        );
      }
    }
  }
}
