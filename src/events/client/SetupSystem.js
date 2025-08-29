"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const I18n_1 = require("../../structures/I18n");
const index_1 = require("../../structures/index");
const SetupSystem_1 = require("../../utils/SetupSystem");
class SetupSystem extends index_1.Event {
    constructor(client, file) {
        super(client, file, {
            name: "setupSystem",
        });
    }
    async run(message) {
        const locale = await this.client.db.getLanguage(message.guildId);
        const channel = message.channel;
        if (!(channel instanceof discord_js_1.TextChannel))
            return;
        if (!message.member?.voice.channel) {
            await (0, SetupSystem_1.oops)(channel, (0, I18n_1.T)(locale, "event.message.no_voice_channel_queue"));
            await message.delete().catch(() => {
                null;
            });
            return;
        }
        const voiceChannel = message.member.voice.channel;
        const clientUser = this.client.user;
        const clientMember = message.guild?.members.cache.get(clientUser.id);
        if (clientMember?.voice.channel &&
            clientMember.voice.channelId !== voiceChannel.id) {
            await (0, SetupSystem_1.oops)(channel, (0, I18n_1.T)(locale, "event.message.different_voice_channel_queue", {
                channel: clientMember.voice.channelId,
            }));
            await message.delete().catch(() => {
                null;
            });
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
            if (!player.connected)
                await player.connect();
        }
        await (0, SetupSystem_1.setupStart)(this.client, message.content, player, message);
        await message.delete().catch(() => {
            null;
        });
    }
}
exports.default = SetupSystem;
