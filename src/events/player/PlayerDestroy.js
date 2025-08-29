"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
const SetupSystem_1 = require("../../utils/SetupSystem");
class PlayerDestroy extends index_1.Event {
    constructor(client, file) {
        super(client, file, {
            name: "playerDestroy",
        });
    }
    async run(player, _reason) {
        const guild = this.client.guilds.cache.get(player.guildId);
        if (!guild)
            return;
        const locale = await this.client.db.getLanguage(player.guildId);
        await (0, SetupSystem_1.updateSetup)(this.client, guild, locale);
        const voiceChannelId = player.voiceChannelId ?? player.options.voiceChannelId;
        if (voiceChannelId) {
            await this.client.utils.setVoiceStatus(this.client, voiceChannelId, "");
        }
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
        if (message.editable) {
            await message.edit({ components: [] }).catch(() => {
                null;
            });
        }
    }
}
exports.default = PlayerDestroy;
