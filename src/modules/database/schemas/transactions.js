import mongoose from "mongoose";

// Schema para transações
const TransactionSchema = new mongoose.Schema({
  source: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5, 6, 7],
  },
  transactionAmount: {
    type: Number,
    required: true,
  },
  receivedBy: {
    type: String,
  },
  givenBy: {
    type: String,
  },
  receivedByUsername: {
    type: String,
  },
  givenByUsername: {
    type: String,
  },
  givenAt: {
    type: Date,
    default: Date.now,
  },
});

const TransactionModel = mongoose.model("Transactions", TransactionSchema);

export class TransactionsDatabase {
  constructor() {
    this.model = TransactionModel;
  }

  async createTransaction(data) {
    try {
      const transaction = new this.model(data);
      await transaction.save();
      return transaction;
    } catch (error) {
      throw new Error(`Erro ao criar transação: ${error.message}`);
    }
  }

  async getTransactions(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      return this.model
        .find({
          $or: [{ receivedBy: userId }, { givenBy: userId }],
        })
        .sort({ givenAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      throw new Error(`Erro ao buscar transações: ${error.message}`);
    }
  }

  async getTransactionCount(userId) {
    try {
      return this.model.countDocuments({
        $or: [{ receivedBy: userId }, { givenBy: userId }],
      });
    } catch (error) {
      throw new Error(`Erro ao contar transações: ${error.message}`);
    }
  }

  transactionDisplayText(tr, user = null) {
    const formatDate = (timestamp) => {
      const time = Math.floor(timestamp.getTime() / 1000);
      return `[<t:${time}:d> <t:${time}:T>]`;
    };

    const amount = Math.abs(tr.transactionAmount).toLocaleString();
    const isReceived = tr.receivedBy === user?.id;
    const action = isReceived ? "📥 Recebeu" : "📤 Enviou";

    const sourceMessages = {
      1: `${action} **${amount}** em uma atualização de saldo.`,
      2: `📥 Recebeu **${amount}** na recompensa diária.`,
      3: `📥 Recebeu **${amount}** na recompensa semanal.`,
      4: `📥 Recebeu **${amount}** na recompensa de trabalho.`,
      5: `${action} **${amount}** em um pagamento ${
        isReceived ? "de" : "para"
      } \`${isReceived ? tr.givenByUsername : tr.receivedByUsername}\` \`(${
        isReceived ? tr.givenBy : tr.receivedBy
      })\`.`,
      6: `${action} **${amount}** apostando com \`${
        isReceived ? tr.givenByUsername : tr.receivedByUsername
      }\` \`(${isReceived ? tr.givenBy : tr.receivedBy})\`.`,
      7: `${action} **${amount}** em uma corrida.`,
    };

    const formattedDate = formatDate(tr.givenAt);
    const message = sourceMessages[tr.source] || "Transação desconhecida.";

    return `${formattedDate} ${message}`;
  }
}
