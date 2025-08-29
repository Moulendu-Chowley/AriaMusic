"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
const BotLog_1 = require("../../utils/BotLog");
class Destroy extends index_1.Event {
    constructor(client, file) {
        super(client, file, {
            name: "destroy",
        });
    }
    async run(node, destroyReason) {
        this.client.logger.success(`Node ${node.id} is destroyed!`);
        (0, BotLog_1.sendLog)(this.client, `Node ${node.id} is destroyed: ${destroyReason}`, "warn");
    }
}
exports.default = Destroy;
