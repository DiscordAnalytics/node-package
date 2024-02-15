import { ShardingManager } from 'discord.js';

const manager = new ShardingManager('./dist/src/test/discordjs/index.js', { token: 'YOUR_DISCORD_TOKEN' });

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();