"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
class PlayerPaused extends index_1.Event {
    constructor(client, file) {
        super(client, file, {
            name: "playerPaused",
        });
    }
    async run(player, track) {
        if (!player || !track)
            return;
        if (player.voiceChannelId) {
            await this.client.utils.setVoiceStatus(this.client, player.voiceChannelId, `⏸️ ${track.info.title}`);
        }
    }
}
exports.default = PlayerPaused;
