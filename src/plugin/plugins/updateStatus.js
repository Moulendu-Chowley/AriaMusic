"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const updateStatusPlugin = {
    name: "Update Status Plugin",
    version: "1.0.0",
    author: "Appu",
    initialize: (client) => {
        client.on(discord_js_1.Events.ClientReady, () => client.utils.updateStatus(client));
    },
};
exports.default = updateStatusPlugin;
