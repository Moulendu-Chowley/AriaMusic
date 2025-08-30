import { Event } from "../../structures/index.js";

/**
 * Represents a playerMuteChange event.
 */
export default class PlayerMuteChange extends Event {
    /**
     * @param {import('../../structures/AriaMusic').default} client The custom client instance.
     * @param {string} file The file name of the event.
     */
    constructor(client, file) {
        super(client, file, {
            name: "playerMuteChange",
        });
    }

    /**
     * Runs the event.
     * @param {import('lavalink-client').Player} player The player that was muted/unmuted.
     * @param {boolean} _selfMuted Whether the player was self-muted/unmuted.
     * @param {boolean} serverMuted Whether the player was server-muted/unmuted.
     */
    async run(player, _selfMuted, serverMuted) {
        if (!player) return;

        if (serverMuted && player.playing && !player.paused) {
            player.pause();
        } else if (!serverMuted && player.paused) {
            player.resume();
        }
    }
}