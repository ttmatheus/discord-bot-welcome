export class EventListener {
  constructor(client, options) {
    this.client = client;

    this.eventName = options.eventName;
  }
}
