import { TextChannel } from "discord.js";
import { T } from "../../structures/I18n.js";
import { Event } from "../../structures/index.js";
import { oops, setupStart } from "../../utils/SetupSystem.js";

/**
 * Represents a setupSystem event.
 */
export default class SetupSystem extends Event {
    /**
     * @param {import('../../structures/AriaMusic').default} client The custom client instance.
     * @param {string} file The file name of the event.
     */
    constructor(client) {
        super(client, {
            name: "setupSystem",
        });
    }

    /**
     * Runs the event.
     * @param {import('discord.js').Message} message The message that triggered the event.
     */
    async run(message) {
        const locale = await this.client.db.getLanguage(message.guildId);
        const channel = message.channel;

        if (!(channel instanceof TextChannel)) return;

        if (!message.member?.voice.channel) {
            await oops(channel, T(locale, "event.message.no_voice_channel_queue"));
            await message.delete().catch(() => null);
            return;
        }

        const voiceChannel = message.member.voice.channel;
        const clientUser = this.client.user;
        const clientMember = message.guild?.members.cache.get(clientUser.id);

        if (clientMember?.voice.channel &&
            clientMember.voice.channelId !== voiceChannel.id) {
            await oops(channel, T(locale, "event.message.different_voice_channel_queue", {
                channel: clientMember.voice.channelId,
            }));
            await message.delete().catch(() => null);
            return;
        }

        let player = this.client.manager.getPlayer(message.guildId);
        if (!player) {
            player = this.client.manager.createPlayer({
                guildId: message.guildId,
                voiceChannelId: voiceChannel.id,
                textChannelId: message.channelId,
                selfMute: false,
                selfDeaf: true,
                vcRegion: voiceChannel.rtcRegion,
            });
            if (!player.connected) await player.connect();
        }

        await setupStart(this.client, message.content, player, message);
        await message.delete().catch(() => null);
    }
}