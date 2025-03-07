export class ClientUtilFunctions {
  constructor(client) {
    this.client = client;
  }

  async findUser(target, message, author = true) {
    if (!target) return author ? message.author : null;

    let user =
      message.mentions.users.first() ||
      this.client.users.cache.get(target) ||
      message.guild?.members.cache.find((member) =>
        member.user.username.toLowerCase().includes(target.toLowerCase()),
      )?.user;

    if (!user && /^\d{17,19}$/.test(target)) {
      try {
        user = await this.client.users.fetch(target);
      } catch {
        user = null;
      }
    }

    return user || (author ? message.author : null);
  }

  async findGuild(target) {
    let guild = this.client.guilds.cache.get(target);

    if (!guild) {
      guild = this.client.guilds.cache.find((g) =>
        g.name.toLowerCase().includes(target.toLowerCase()),
      );
    }

    if (!guild) {
      try {
        guild = await this.client.guilds.fetch(target);
      } catch (error) {
        return null;
      }
    }

    return guild;
  }
}
