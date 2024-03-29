import { createClient } from "redis";

const client = createClient({
    url: process.env.REDIS_CONN,
});
client.connect();

export default client;