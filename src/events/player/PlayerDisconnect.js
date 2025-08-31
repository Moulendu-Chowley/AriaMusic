import { Event } from "../../structures/index.js";
import { updateSetup } from "../../utils/SetupSystem.js";

/**
 * Represents a playerDisconnect event.
 */
export default class PlayerDisconnect extends Event {
    /**
     * @param {import('../../structures/AriaMusic').default} client The custom client instance.
     * @param {string} file The file name of the event.
     */
    constructor(client) {
        super(client, {
            name: "playerDisconnect",
        });
    }

    /**
     * Runs the event.
     * @param {import('lavalink-client').Player} player The player that disconnected.
     * @param {string} voiceChannelId The ID of the voice channel the player was in.
     */
    async run(player, voiceChannelId) {
        const guild = this.client.guilds.cache.get(player.guildId);
        if (!guild) return;

        const locale = await this.client.db.getLanguage(player.guildId);
        await updateSetup(this.client, guild, locale);

        if (voiceChannelId) {
            await this.client.utils.setVoiceStatus(this.client, voiceChannelId, "");
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