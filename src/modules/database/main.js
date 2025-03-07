import mongoose from "mongoose";
import "dotenv/config";

import { UsersDatabase } from "./schemas/users.js";
import { GuildsDatabase } from "./schemas/guilds.js";
import { TransactionsDatabase } from "./schemas/transactions.js";

import colors from "colors";

export class Database {
  constructor(client) {
    this.client = client;
    this.connection = null;

    this.users = new UsersDatabase();
    this.guilds = new GuildsDatabase();
    this.transactions = new TransactionsDatabase();
  }

  async connectDatabase() {
    try {
      this.connection = await mongoose.connect(process.env.MONGO_URI);
      console.log(
        `[🍃 DATABASE]`.bgGreen + ` - Conectado ao banco de dados com sucesso!`,
      );
    } catch (error) {
      console.log(
        `[🍃 DATABASE]`.bgRed +
          ` - Falha ao tentar conectar ao banco de dados!`,
      );
      process.exit(1);
    }
  }

  getOrUpdateUser(userId, updatedData) {
    return this.users.getOrUpdate(userId, updatedData);
  }

  getOrUpdateGuild(guildId, updatedData) {
    return this.guilds.getOrUpdate(guildId, updatedData);
  }

  updateUserBalance(userId, amount) {
    return this.users.getOrUpdate(userId, {
      $inc: {
        userBalance: amount,
      },
    });
  }

  updateUserCooldowns(userId, newTimestamp, cooldownType) {
    return this.users.getOrUpdate(userId, {
      $set: {
        [`userGlobalCooldowns.${cooldownType}`]: newTimestamp,
      },
    });
  }

  async createTransaction(data) {
    return this.transactions.createTransaction(data);
  }

  async getTransactions(user_id, page = 1, limit = 10) {
    return this.transactions.getTransactions(user_id, page, limit);
  }

  async getTransactionCount(user_id) {
    return this.transactions.getTransactionCount(user_id);
  }

  transactionDisplayText(tr, user = null) {
    return this.transactions.transactionDisplayText(tr, user);
  }
}
