"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
const SetupSystem_1 = require("../../utils/SetupSystem");
class TrackEnd extends index_1.Event {
    constructor(client, file) {
        super(client, file, {
            name: "trackEnd",
        });
    }
    async run(player, _track, _payload) {
        const guild = this.client.guilds.cache.get(player.guildId);
        if (!guild)
            return;
        const locale = await this.client.db.getLanguage(player.guildId);
        await (0, SetupSystem_1.updateSetup)(this.client, guild, locale);
        const messageId = player.get("messageId");
        if (!messageId)
            return;
        const channel = guild.channels.cache.get(player.textChannelId);
        if (!channel)
            return;
        const message = await channel.messages.fetch(messageId).catch(() => {
            null;
        });
        if (!message)
            return;
        message.delete().catch(() => {
            null;
        });
    }
}
exports.default = TrackEnd;
