import { ShardingManager } from 'discord.js';
import { env } from './env.js';

/**
 * @param {import('./structures/Logger.js').default} logger
 */
export async function shardStart(logger) {
    const manager = new ShardingManager('./src/LavaClient.js', {
        respawn: true,
        token: env.TOKEN,
        totalShards: 'auto',
        shardList: 'auto',
    });

    manager.on('shardCreate', (shard) => {
        shard.on('ready', () => {
            logger.start(`[CLIENT] Shard ${shard.id} connected to Discord's Gateway.`);
        });
    });

    await manager.spawn();
    logger.start(`[CLIENT] ${manager.totalShards} shard(s) spawned.`);
}