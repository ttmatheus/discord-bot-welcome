import "dotenv/config";
import Client from "./src/structures/client.js";

const client = new Client();

client.start();

export default client;
