import mongoose from "mongoose";

const GuildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
});

const GuildModel = mongoose.model("Guilds", GuildSchema);

export class GuildsDatabase {
  constructor() {
    this.model = GuildModel;
  }

  async getOrUpdate(guildId, updatedData = {}) {
    let guild = await this.model.findOneAndUpdate({ guildId }, updatedData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    return guild;
  }
}
