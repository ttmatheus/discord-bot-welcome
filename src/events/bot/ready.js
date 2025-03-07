import { EventListener } from "../../structures/events.js";
import colors from "colors";

export default class Event extends EventListener {
  constructor(client) {
    super(client, {
      eventName: "ready",
    });

    this.currentStatusIndex = 0;
  }

  async execute() {
    const statuses = this.client.config.botStatus.status;
    const interval = this.client.config.botStatus.interval;

    if (!Array.isArray(statuses) || statuses.length === 0)
      return this.client.logger.error(
        "O array de status está vazio ou inválido.",
      );

    if (typeof interval !== "number" || interval <= 0)
      return this.client.logger.error(
        "O intervalo deve ser um número positivo em milissegundos.",
      );

    this.updateStatus();

    setInterval(() => this.updateStatus(), interval);

    await this.client.loaders.registerSlashCommands();

    console.log(
      `[🚀 APLICAÇÃO]`.bgWhite +
        ` - Aplicação on-line e funcionando como "${this.client.user.tag}".`,
    );
  }

  updateStatus() {
    const statuses = this.client.config.botStatus.status;
    const status = statuses[this.currentStatusIndex];

    this.client.user.setActivity(status.name, { type: status.type });
    this.currentStatusIndex = (this.currentStatusIndex + 1) % statuses.length;
  }
}
