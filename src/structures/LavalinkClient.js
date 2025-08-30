import { LavalinkManager } from "lavalink-client";
import { requesterTransformer, autoPlayFunction } from "../utils/functions/player.js";

/**
 * Represents a Lavalink client.
 */
export default class LavalinkClient extends LavalinkManager {
    client;

    /**
     * @param {import('./AriaMusic').default} client The custom client instance.
     */
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
                requesterTransformer: requesterTransformer,
                onEmptyQueue: {
                    autoPlayFunction: autoPlayFunction,
                },
            },
            autoMove: true,
        });
        this.client = client;
    }

    /**
     * Searches for a track.
     * @param {string | import('lavalink-client').SearchQuery} query The query to search for.
     * @param {import('discord.js').User} user The user who requested the search.
     * @param {import('lavalink-client').SearchPlatform} [source] The source to search from.
     * @returns {Promise<import('lavalink-client').SearchResult>}
     */
    async search(query, user, source) {
        const nodes = this.nodeManager.leastUsedNodes();
        const node = nodes[Math.floor(Math.random() * nodes.length)];
        const searchOptions = typeof query === "string" ? { query, source } : query;
        return await node.search(searchOptions, user, false);
    }
}