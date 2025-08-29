"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const topgg_autoposter_1 = require("topgg-autoposter");
const env_1 = require("../../env");
const index_1 = require("../../structures/index");
const discord_js_1 = require("discord.js");
class Ready extends index_1.Event {
    constructor(client, file) {
        super(client, file, {
            name: discord_js_1.Events.ClientReady,
        });
    }
    async run() {
        this.client.logger.success(`${this.client.user?.tag} is ready!`);
        this.client.user?.setPresence({
            activities: [
                {
                    name: env_1.env.BOT_ACTIVITY,
                    type: env_1.env.BOT_ACTIVITY_TYPE,
                },
            ],
            status: env_1.env.BOT_STATUS,
        });
        if (env_1.env.TOPGG) {
            const autoPoster = (0, topgg_autoposter_1.AutoPoster)(env_1.env.TOPGG, this.client);
            setInterval(() => {
                autoPoster.on("posted", (_stats) => {
                    this.client.logger.info("Successfully posted stats to Top.gg!");
                });
            }, 86400000);
        }
        else {
            this.client.logger.warn("Top.gg token not found. Skipping auto poster.");
        }
        await this.client.manager.init({ ...this.client.user, shards: "auto" });
    }
}
exports.default = Ready;
