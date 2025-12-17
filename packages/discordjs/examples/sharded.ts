import { ShardingManager } from "discord.js";
import "dotenv/config";

const manager = new ShardingManager("./index.ts", {
  token: process.env.DISCORD_TOKEN,
});

manager.on("shardCreate", (shard) => console.log(`Launched shard ${shard.id}`));

manager.spawn();
