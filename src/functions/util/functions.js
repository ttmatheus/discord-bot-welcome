import moment from "moment";
import "moment-precise-range-plugin";

export class UtilFunctions {
  constructor(client) {
    this.client = client;
  }

  async awaitTimeout(ms) {
    if (typeof ms !== "number") return;

    await new Promise((resolve) => {
      setTimeout(() => {
        return resolve();
      }, ms);
    });
  }

  genPercentage(va, vl, pre = 2) {
    if (!va || !vl || typeof va !== "number" || typeof vl !== "number")
      return "0%";
    if (vl === 0) return "0%";
    if (typeof pre !== "number" || pre < 0) pre = 2;

    const percentage = ((va / vl) * 100).toFixed(pre);
    return `${percentage}%`;
  }

  genString(size) {
    if (typeof size !== "number") return null;

    const charSet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    return Array.from({ length: size }, () =>
      charSet.charAt(Math.floor(Math.random() * charSet.length)),
    ).join("");
  }

  genNumber(min, max, integer = false, pre = 2) {
    if (typeof min !== "number" || typeof max !== "number" || min >= max)
      return null;

    if (integer) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
      const factor = Math.pow(10, pre);
      return Math.round((Math.random() * (max - min) + min) * factor) / factor;
    }
  }

  genProgressBar(current, total, size, char1 = "■", char2 = "□") {
    if (typeof current !== "number" || typeof total !== "number" || total < 0)
      return "Falha ao gerar barra de progresso...";
    if (typeof size !== "number" || size <= 0)
      return "Falha ao gerar barra de progresso...";

    if (total === 0) return char2.repeat(size);

    const progress = Math.min(Math.round((size * current) / total), size);

    return char1.repeat(progress) + char2.repeat(size - progress);
  }

  formatNumberToLocale(number, pre = 2) {
    if (typeof number !== "number" || isNaN(number)) {
      return null;
    }

    return number.toLocaleString("pt-BR", {
      maximumFractionDigits: pre,
    });
  }

  formatTimeString(timestamp, pre = 2) {
    const diff = moment.preciseDiff(Date.now(), timestamp, true);
    const units = [
      { key: "years", singular: "ano", plural: "anos" },
      { key: "months", singular: "mês", plural: "meses" },
      { key: "days", singular: "dia", plural: "dias" },
      { key: "hours", singular: "hora", plural: "horas" },
      { key: "minutes", singular: "minuto", plural: "minutos" },
      { key: "seconds", singular: "segundo", plural: "segundos" },
    ];

    const arr = units
      .filter((unit) => diff[unit.key] > 0)
      .map(
        (unit) =>
          `${diff[unit.key]} ${
            diff[unit.key] === 1 ? unit.singular : unit.plural
          }`,
      );

    if (arr.length === 0) return "alguns milissegundos...";
    if (arr.length === 1) return arr[0];

    const limitedArr = arr.slice(0, pre);

    return limitedArr.length > 1
      ? limitedArr.slice(0, -1).join(", ") +
          " e " +
          limitedArr[limitedArr.length - 1]
      : limitedArr[0];
  }
}
