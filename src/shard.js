"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shardStart = shardStart;
const discord_js_1 = require("discord.js");
const env_1 = require("./env");
async function shardStart(logger) {
    const manager = new discord_js_1.ShardingManager("./src/LavaClient.js", {
        respawn: true,
        token: env_1.env.TOKEN,
        totalShards: "auto",
        shardList: "auto",
    });
    manager.on("shardCreate", (shard) => {
        shard.on("ready", () => {
            logger.start(`[CLIENT] Shard ${shard.id} connected to Discord's Gateway.`);
        });
    });
    await manager.spawn();
    logger.start(`[CLIENT] ${manager.totalShards} shard(s) spawned.`);
}
