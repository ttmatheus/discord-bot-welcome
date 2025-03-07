import colors from "colors";

import { WebhookClient } from "discord.js";
import fs from "fs";
import path from "path";

export class Logger {
  constructor(client) {
    this.client = client;
    this.webhookLoggers = this.client.config.webhookLoggers;

    this.errorWebhook =
      this.webhookLoggers.errors &&
      new WebhookClient({ url: this.webhookLoggers.errors });
    this.eventWebhook =
      this.webhookLoggers.events &&
      new WebhookClient({ url: this.webhookLoggers.events });
  }

  success(text) {
    const logMessage = `${`[${new Date().toISOString()}]`.bgCyan} ${
      `[✅ SUCESSO]`.green
    } - ${text}.`;

    console.log(logMessage);
  }

  error(text, error = null) {
    const logMessage = `${`[${new Date().toISOString()}]`.bgCyan} ${
      `[❌ ERRO]`.red
    } - ${text}.`;

    console.error(logMessage, error);
    this.saveToFile("error", text, error);
  }

  warn(text, error = null) {
    const logMessage = `${`[${new Date().toISOString()}]`.bgCyan} ${
      `[⚠️ AVISO]`.yellow
    } - ${text}.`;

    console.warn(logMessage, error);
    this.saveToFile("warn", text, error);
  }

  info(text) {
    const logMessage = `${`[${new Date().toISOString()}]`.bgCyan} ${
      `[❗ INFORMAÇÃO]`.blue
    } - ${text}.`;

    console.log(logMessage);
  }

  event(text) {
    const logMessage = `${`[${new Date().toISOString()}]`.bgCyan} ${
      `[🌎 EVENTO]`.magenta
    } - ${text}.`;

    console.log(logMessage);
    this.saveToFile("event", text);
  }

  saveToFile(type, message, error = null) {
    const tempDir = "./src/assets/temp";
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const fileName = `${type}-${Date.now()}.log`;
    const filePath = path.join(tempDir, fileName);

    const logContent = `[${new Date().toISOString()}] [${type.toUpperCase()}]: ${message}${
      error ? `\nErro detalhado:\n${error.stack || error}` : ""
    }\n\n`;

    fs.writeFileSync(filePath, logContent);

    const webhook = ["error", "warn"].includes(type)
      ? this.errorWebhook
      : this.eventWebhook;
    if (webhook) {
      webhook
        .send({
          files: [filePath],
        })
        .then(() => {
          fs.unlinkSync(filePath);
        })
        .catch((err) => {
          console.error(
            `${`[${new Date().toISOString()}]`.bgCyan} ${
              `[❌ ERRO]`.red
            } - Falha ao enviar arquivo de log para o webhook:.`,
            err,
          );
          fs.unlinkSync(filePath);
        });
    } else {
      fs.unlinkSync(filePath);
    }
  }
}
