"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lavalink_client_1 = require("lavalink-client");
const player_1 = require("../utils/functions/player");
class LavalinkClient extends lavalink_client_1.LavalinkManager {
    client;
    constructor(client) {
        super({
            nodes: client.env.NODES,
            sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard?.send(payload),
            autoSkip: true,
            client: {
                id: client.env.CLIENT_ID,
                username: "Aria Music",
            },
            queueOptions: {
                maxPreviousTracks: 25,
            },
            playerOptions: {
                defaultSearchPlatform: client.env.SEARCH_ENGINE,
                onDisconnect: {
                    autoReconnect: true,
                    destroyPlayer: false,
                },
                requesterTransformer: player_1.requesterTransformer,
                onEmptyQueue: {
                    autoPlayFunction: player_1.autoPlayFunction,
                },
            },
            autoMove: true,
        });
        this.client = client;
    }
    async search(query, user, source) {
        const nodes = this.nodeManager.leastUsedNodes();
        const node = nodes[Math.floor(Math.random() * nodes.length)];
        const searchOptions = typeof query === "string" ? { query, source } : query;
        return await node.search(searchOptions, user, false);
    }
}
exports.default = LavalinkClient;
