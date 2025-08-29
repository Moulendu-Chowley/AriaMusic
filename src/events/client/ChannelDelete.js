"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../structures/index");
class ChannelDelete extends index_1.Event {
    constructor(client, file) {
        super(client, file, {
            name: "channelDelete",
        });
    }
    async run(channel) {
        const { guild } = channel;
        const setup = await this.client.db.getSetup(guild.id);
        const stay = await this.client.db.get_247(guild.id);
        if (Array.isArray(stay)) {
            for (const s of stay) {
                if (channel.type === discord_js_1.ChannelType.GuildVoice &&
                    s.voiceId === channel.id) {
                    await this.client.db.delete_247(guild.id);
                    break;
                }
            }
        }
        else if (stay) {
            if (channel.type === discord_js_1.ChannelType.GuildVoice &&
                stay.voiceId === channel.id) {
                await this.client.db.delete_247(guild.id);
            }
        }
        if (setup &&
            channel.type === discord_js_1.ChannelType.GuildText &&
            setup.textId === channel.id) {
            await this.client.db.deleteSetup(guild.id);
        }
        const player = this.client.manager.getPlayer(guild.id);
        if (player && player.voiceChannelId === channel.id) {
            await player.destroy();
        }
    }
}
exports.default = ChannelDelete;
