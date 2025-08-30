import { ChannelType } from "discord.js";
import { Event } from "../../structures/index.js";

/**
 * Represents a channelDelete event.
 */
export default class ChannelDelete extends Event {
    /**
     * @param {import('../../structures/AriaMusic').default} client The custom client instance.
     * @param {string} file The file name of the event.
     */
    constructor(client) {
        super(client, {
            name: "channelDelete",
        });
    }

    /**
     * Runs the event.
     * @param {import('discord.js').GuildChannel} channel The channel that was deleted.
     */
    async run(channel) {
        const { guild } = channel;
        const setup = await this.client.db.getSetup(guild.id);
        const stay = await this.client.db.get_247(guild.id);

        if (Array.isArray(stay)) {
            for (const s of stay) {
                if (channel.type === ChannelType.GuildVoice &&
                    s.voiceId === channel.id) {
                    await this.client.db.delete_247(guild.id);
                    break;
                }
            }
        } else if (stay) {
            if (channel.type === ChannelType.GuildVoice &&
                stay.voiceId === channel.id) {
                await this.client.db.delete_247(guild.id);
            }
        }

        if (setup &&
            channel.type === ChannelType.GuildText &&
            setup.textId === channel.id) {
            await this.client.db.deleteSetup(guild.id);
        }

        const player = this.client.manager.getPlayer(guild.id);
        if (player && player.voiceChannelId === channel.id) {
            await player.destroy();
        }
    }
}