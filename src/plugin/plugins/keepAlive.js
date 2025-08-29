"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_http_1 = tslib_1.__importDefault(require("node:http"));
const env_1 = require("../../env");
const keepAlive = {
    name: "KeepAlive Plugin",
    version: "1.0.0",
    author: "Appu",
    initialize: (client) => {
        if (env_1.env.KEEP_ALIVE) {
            const server = node_http_1.default.createServer((_req, res) => {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(`I'm alive! Currently serving ${client.guilds.cache.size} guilds.`);
            });
            server.listen(3000, () => {
                client.logger.info("Keep-Alive server is running on port 3000");
            });
        }
    },
};
exports.default = keepAlive;
