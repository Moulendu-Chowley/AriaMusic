"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
class PlayerMuteChange extends index_1.Event {
    constructor(client, file) {
        super(client, file, {
            name: "playerMuteChange",
        });
    }
    async run(player, _selfMuted, serverMuted) {
        if (!player)
            return;
        if (serverMuted && player.playing && !player.paused) {
            player.pause();
        }
        else if (!serverMuted && player.paused) {
            player.resume();
        }
    }
}
exports.default = PlayerMuteChange;
