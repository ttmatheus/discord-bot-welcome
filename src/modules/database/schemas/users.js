import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userBalance: { type: Number, default: 0 },
  userGlobalCooldowns: {
    dailyCooldown: { type: Number, default: 0 },
    weeklyCooldown: { type: Number, default: 0 },
    workCooldown: { type: Number, default: 0 },
  },
  userBanishmentData: {
    banTimestamp: { type: Number, default: 0 },
    banReason: { type: String },
    banAuthor: { type: String },
  },
});

const UserModel = mongoose.model("Users", UserSchema);

export class UsersDatabase {
  constructor() {
    this.model = UserModel;
  }

  async getOrUpdate(userId, updatedData = {}) {
    let user = await this.model.findOneAndUpdate({ userId }, updatedData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    return user;
  }
}
