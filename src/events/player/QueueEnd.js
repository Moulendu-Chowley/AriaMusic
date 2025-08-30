import { Event } from "../../structures/index.js";
import { updateSetup } from "../../utils/SetupSystem.js";

/**
 * Represents a queueEnd event.
 */
export default class QueueEnd extends Event {
    /**
     * @param {import('../../structures/AriaMusic').default} client The custom client instance.
     * @param {string} file The file name of the event.
     */
    constructor(client, file) {
        super(client, file, {
            name: "queueEnd",
        });
    }

    /**
     * Runs the event.
     * @param {import('lavalink-client').Player} player The player that ended the queue.
     * @param {import('lavalink-client').Track} _track The track that was playing.
     * @param {any} _payload The payload of the event.
     */
    async run(player, _track, _payload) {
        const guild = this.client.guilds.cache.get(player.guildId);
        if (!guild) return;

        const locale = await this.client.db.getLanguage(player.guildId);
        await updateSetup(this.client, guild, locale);

        if (player.voiceChannelId) {
            await this.client.utils.setVoiceStatus(this.client, player.voiceChannelId, "");
        }

        const messageId = player.get("messageId");
        if (!messageId) return;

        const channel = guild.channels.cache.get(player.textChannelId);
        if (!channel) return;

        const message = await channel.messages.fetch(messageId).catch(() => null);
        if (!message) return;

        if (message.editable) {
            await message.edit({ components: [] }).catch(() => null);
        }
    }
}