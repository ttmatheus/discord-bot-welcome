import { EmbedBuilder } from "discord.js";

export default class GuildMemberRemove {
  constructor(client) {
    this.client = client;
    this.eventName = "guildMemberRemove";
  }

  async execute(member) {
    const { welcomeSystem } = this.client.config;

    if (
      !welcomeSystem ||
      !welcomeSystem.leaveChannel ||
      !welcomeSystem.leaveMessage
    )
      return;

    const channel = member.guild.channels.cache.get(welcomeSystem.leaveChannel);
    if (!channel) return;

    let messageContent = welcomeSystem.leaveMessage
      .replace(/{user}/g, member.user.tag)
      .replace(/{server}/g, member.guild.name)
      .replace(/{memberCount}/g, member.guild.memberCount);

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
