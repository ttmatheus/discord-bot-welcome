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

  convertArgsToTime(args) {
    const timePatterns = [
      { regex: /([0-9]+)\s*(s|seg|segs|second|seconds)/i, unit: "s" },
      { regex: /([0-9]+)\s*(min|m|mins|minutos|minutes)/i, unit: "min" },
      { regex: /([0-9]+)\s*(h|hour|hora|horas|hours)/i, unit: "h" },
      { regex: /([0-9]+)\s*(d|dias|days)/i, unit: "d" },
      { regex: /([0-9]+)\s*(w|semana|semanas|weeks)/i, unit: "w" },
      { regex: /([0-9]+)\s*(month(s)?|m(e|ê)s(es)?)/i, unit: "month" },
      { regex: /([0-9]+)\s*(y|a|anos|years)/i, unit: "y" },
    ];

    const addTime = (value, unit) => {
      const unitsInMs = {
        s: 1000,
        min: 60000,
        h: 3600000,
        d: 86400000,
        w: 604800000,
        month: 2629800000,
        y: 31557600000,
      };
      return value * (unitsInMs[unit] || 0);
    };

    const processDate = (input) => {
      const DATE_FORMAT = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = input.match(DATE_FORMAT);
      if (match) {
        const [_, day, month, year] = match;
        const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
        const timeDiff = date.getTime() - Date.now();
        return timeDiff > 0 ? timeDiff : 0;
      }
      return null;
    };

    const processHour = (input) => {
      const HOUR_FORMAT = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
      const match = input.match(HOUR_FORMAT);
      if (match) {
        const [hours, minutes] = input.split(":");
        const now = new Date();
        const targetTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes,
        );
        const timeDiff = targetTime.getTime() - now.getTime();
        return timeDiff > 0 ? timeDiff : 0;
      }
      return null;
    };

    const input = String(args).toLowerCase().replace(/,/g, " ");

    const dateResult = processDate(input);
    if (dateResult !== null) return dateResult;

    const hourResult = processHour(input);
    if (hourResult !== null) return hourResult;

    let timeInMs = 0;
    for (const { regex, unit } of timePatterns) {
      const match = input.match(regex);
      if (match) {
        const value = parseInt(match[1], 10);
        timeInMs += addTime(value, unit);
      }
    }

    return timeInMs > 0 ? timeInMs : 0;
  }

  formatNumber(target, max_author = 0, max_opponent = 0, max_total = 0) {
    const validateNumber = (value) => {
      const parsedValue = parseFloat(value);
      return isNaN(parsedValue) ? 0 : parsedValue;
    };

    max_author = validateNumber(max_author);
    max_opponent = validateNumber(max_opponent);
    max_total = validateNumber(max_total);

    let res = 0;

    if (!isNaN(target)) {
      res = validateNumber(target);
    } else {
      const targetLower = String(target).toLowerCase();

      const calculateMax = () => {
        return Math.min(
          max_author,
          max_opponent > 0 ? max_opponent : max_author,
        );
      };

      const calculateHalf = () => {
        return Math.floor(calculateMax() / 2);
      };

      const calculateRemainder = () => {
        const length = max_author.toString().length;
        const divisor = Math.pow(10, length - 1);
        return max_author % divisor;
      };

      const processSuffix = (input) => {
        const multipliers = {
          k: 1_000,
          m: 1_000_000,
          b: 1_000_000_000,
          kk: 1_000_000,
        };
        const match = input.match(/^(\d+\.?\d*)([kmb]|kk)$/i);
        if (match) {
          const [_, value, suffix] = match;
          return parseFloat(value) * (multipliers[suffix.toLowerCase()] || 1);
        }
        return parseFloat(input);
      };

      if (["max", "all", "tudo"].includes(targetLower)) {
        res = calculateMax();
      } else if (["half", "metade"].includes(targetLower)) {
        res = calculateHalf();
      } else if (["sobras"].includes(targetLower)) {
        res = calculateRemainder();
      } else {
        res = processSuffix(targetLower);
      }
    }

    if (max_total > 0 && res > max_total) {
      res = max_total;
    }

    res = Math.round(res * 100) / 100;

    return isNaN(res) ? 0 : res;
  }
}
