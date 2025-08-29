"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
const BotLog_1 = require("../../utils/BotLog");
class ErrorEvent extends index_1.Event {
    constructor(client, file) {
        super(client, file, {
            name: "error",
        });
    }
    async run(node, error) {
        this.client.logger.error(`Node ${node.id} error: ${error.stack || error.message}`);
        (0, BotLog_1.sendLog)(this.client, `Node ${node.id} encountered an error: ${error.stack || error.message}`, "error");
    }
}
exports.default = ErrorEvent;
