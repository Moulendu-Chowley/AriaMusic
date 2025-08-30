import { AutoPoster } from "topgg-autoposter";
import { env } from "../../env.js";
import { Event } from "../../structures/index.js";
import { Events } from "discord.js";

/**
 * Represents a clientReady event.
 */
export default class Ready extends Event {
    /**
     * @param {import('../../structures/AriaMusic').default} client The custom client instance.
     * @param {string} file The file name of the event.
     */
    constructor(client, file) {
        super(client, file, {
            name: Events.ClientReady,
        });
    }

    /**
     * Runs the event.
     */
    async run() {
        this.client.logger.success(`${this.client.user?.tag} is ready!`);
        this.client.user?.setPresence({
            activities: [
                {
                    name: env.BOT_ACTIVITY,
                    type: env.BOT_ACTIVITY_TYPE,
                },
            ],
            status: env.BOT_STATUS,
        });

        if (env.TOPGG) {
            const autoPoster = AutoPoster(env.TOPGG, this.client);
            setInterval(() => {
                autoPoster.on("posted", (_stats) => {
                    this.client.logger.info("Successfully posted stats to Top.gg!");
                });
            }, 86400000);
        } else {
            this.client.logger.warn("Top.gg token not found. Skipping auto poster.");
        }

        await this.client.manager.init({ ...this.client.user, shards: "auto" });
    }
}