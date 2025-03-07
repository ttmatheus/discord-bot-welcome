import os from "os";

export class AntiCrash {
  constructor(client) {
    this.client = client;
    this.maxMemoryUsage = 200;
    this.maxCPUusage = 20.0;
    this.monitoringInterval = 180_000;
  }

  initialize() {
    this.setupGlobalErrorHandlers();
    this.setupResourceMonitoring();
    this.setupAutoRestart();
  }

  setupGlobalErrorHandlers() {
    process.on("uncaughtException", (error) => {
      this.client.logger.error("Exceção não tratada detectada", error);
    });

    process.on("unhandledRejection", (reason, promise) => {
      this.client.logger.error("Rejeição não tratada detectada", reason);
    });

    process.on("warning", (warning) => {
      this.client.logger.warn("Aviso detectado", warning);
    });
  }

  setupResourceMonitoring() {
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = os.loadavg()[0];

      this.client.logger.info(
        `Memória: ${this.formatBytes(memoryUsage.heapUsed)}`,
      );
      this.client.logger.info(`CPU Load: ${cpuUsage.toFixed(2)}`);

      if (memoryUsage.heapUsed > this.maxMemoryUsage * 1024 * 1024) {
        this.client.logger.warn("Uso excessivo de memória detectado!");
      }

      if (cpuUsage > this.maxCPUusage) {
        this.client.logger.warn("Uso excessivo de CPU detectado!");
      }
    }, this.monitoringInterval);
  }

  setupAutoRestart() {
    process.on("SIGINT", () => {
      this.client.logger.info("Reiniciando o bot...");
      process.exit(0);
    });

    process.on("exit", () => {
      this.client.logger.info("Bot encerrado. Reiniciando...");
    });
  }

  formatBytes(bytes) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unit = 0;

    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }

    return `${size.toFixed(2)} ${units[unit]}`;
  }
}
