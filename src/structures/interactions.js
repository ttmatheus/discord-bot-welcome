import colors from "colors";

export class InteractionBase {
  constructor(client, options) {
    this.client = client;
    this.name = options.name;
    this.type = options.type;
  }
}
