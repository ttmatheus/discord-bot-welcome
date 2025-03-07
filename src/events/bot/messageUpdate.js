import { EventListener } from "../../structures/events.js";

import colors from "colors";

export default class Event extends EventListener {
  constructor(client) {
    super(client, {
      eventName: "messageUpdate",
    });
  }

  async execute(oldMessageContent, newMessageContent) {
    if (newMessageContent?.author?.bot || !newMessageContent?.guild?.id) return;
    if (oldMessageContent?.content == newMessageContent?.content) return;

    this.client.emit("messageCreate", newMessageContent);
  }
}
