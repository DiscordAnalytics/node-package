import { ShardingManager } from 'discord.js';
import {config} from "dotenv";

config()

const manager = new ShardingManager('./dist/src/test/discordjs/index.js', { token: process.env.DISCORD_TOKEN });

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();