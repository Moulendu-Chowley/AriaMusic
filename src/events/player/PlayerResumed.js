import { Event } from "../../structures/index.js";

/**
 * Represents a playerResumed event.
 */
export default class PlayerResumed extends Event {
    /**
     * @param {import('../../structures/AriaMusic').default} client The custom client instance.
     * @param {string} file The file name of the event.
     */
    constructor(client, file) {
        super(client, file, {
            name: "playerResumed",
        });
    }

    /**
     * Runs the event.
     * @param {import('lavalink-client').Player} player The player that was resumed.
     * @param {import('lavalink-client').Track} track The track that was resumed.
     */
    async run(player, track) {
        if (!player || !track) return;

        if (player.voiceChannelId) {
            await this.client.utils.setVoiceStatus(this.client, player.voiceChannelId, `🎵 ${track.info.title}`);
        }
    }
}