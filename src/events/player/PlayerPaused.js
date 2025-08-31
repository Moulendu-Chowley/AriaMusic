import { Event } from "../../structures/index.js";

/**
 * Represents a playerPaused event.
 */
export default class PlayerPaused extends Event {
    /**
     * @param {import('../../structures/AriaMusic').default} client The custom client instance.
     * @param {string} file The file name of the event.
     */
    constructor(client) {
        super(client, {
            name: "playerPaused",
        });
    }

    /**
     * Runs the event.
     * @param {import('lavalink-client').Player} player The player that was paused.
     * @param {import('lavalink-client').Track} track The track that was paused.
     */
    async run(player, track) {
        if (!player || !track) return;

        if (player.voiceChannelId) {
            await this.client.utils.setVoiceStatus(this.client, player.voiceChannelId, `⏸️ ${track.info.title}`);
        }
    }
}