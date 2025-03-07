import { InteractionBase } from "../../structures/interactions.js";

export default class Interaction extends InteractionBase {
  constructor(client) {
    super(client, {
      name: "pagar",
      type: "autocomplete",
    });
  }

  async execute(interaction, options) {
    const focused = interaction.options.getFocused();
    const economy = this.client.economy;

    let authorData = await this.client.database.getOrUpdateUser(
      interaction.user.id,
    );

    const preValues = [
      { name: "tudo", value: "all" },
      { name: "metade", value: "half" },
      { name: "sobras", value: "sobras" },
      { name: `mínimo`, value: economy.limiters.payment.min },
      { name: this.client.utils.formatNumberToLocale(500), value: 500 },
      { name: this.client.utils.formatNumberToLocale(1_000), value: 1_000 },
      { name: this.client.utils.formatNumberToLocale(10_000), value: 10_000 },
      { name: this.client.utils.formatNumberToLocale(25_000), value: 25_000 },
    ];

    const values = preValues.filter((val) =>
      val.name.toLowerCase().includes(focused.toLowerCase()),
    );

    const amount = await this.client.utils.formatNumber(
      focused,
      authorData.userBalance,
      0,
      economy.limiters.payment.max,
    );

    if (typeof amount === "number" && amount >= economy.limiters.payment.min) {
      values.push({
        name: `${this.client.utils.formatNumberToLocale(amount)}`,
        value: amount.toString(),
      });
    }

    await interaction.respond(
      values.slice(0, 25).map((val) => ({
        name: val.name,
        value: val.value.toString(),
      })),
    );
  }
}
