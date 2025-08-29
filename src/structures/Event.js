"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Event {
    client;
    one;
    file;
    name;
    fileName;
    constructor(client, file, options) {
        this.client = client;
        this.file = file;
        this.name = options.name;
        this.one = options.one ?? false;
        this.fileName = file.split(".")[0];
    }
    async run(..._args) {
        return await Promise.resolve();
    }
}
exports.default = Event;
