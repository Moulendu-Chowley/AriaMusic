"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
class Raw extends index_1.Event {
    client;
    constructor(client, file) {
        super(client, file, {
            name: "raw",
        });
        this.client = client;
    }
    async run(d) {
        this.client.manager.sendRawData(d);
    }
}
exports.default = Raw;
