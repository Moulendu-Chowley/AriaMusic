import { Event } from "../../structures/index.js";
import { sendLog } from "../../utils/BotLog.js";

/**
 * Represents a connect event.
 */
export default class Connect extends Event {
    /**
     * @param {import('../../structures/AriaMusic').default} client The custom client instance.
     * @param {string} file The file name of the event.
     */
    constructor(client, file) {
        super(client, file, {
            name: "connect",
        });
    }

    /**
     * Runs the event.
     * @param {import('lavalink-client').LavalinkNode} node The Lavalink node that connected.
     */
    async run(node) {
        this.client.logger.success(`Node ${node.id} is ready!`);
        let data = await this.client.db.get_247();
        if (!data) return;

        if (!Array.isArray(data)) {
            data = [data];
        }

        data.forEach((main, index) => {
            setTimeout(async () => {
                const guild = this.client.guilds.cache.get(main.guildId);
                if (!guild) return;

                const channel = guild.channels.cache.get(main.textId);
                const vc = guild.channels.cache.get(main.voiceId);

                if (channel && vc) {
                    try {
                        const player = this.client.manager.createPlayer({
                            guildId: guild.id,
                            voiceChannelId: vc.id,
                            textChannelId: channel.id,
                            selfDeaf: true,
                            selfMute: false,
                        });
                        if (!player.connected) await player.connect();
                    } catch (error) {
                        this.client.logger.error(`Failed to create queue for guild ${guild.id}: ${error}`);
                    }
                } else {
                    this.client.logger.warn(`Missing channels for guild ${guild.id}. Text channel: ${main.textId}, Voice channel: ${main.voiceId}`);
                }
            }, index * 1000);
        });

        sendLog(this.client, `Node ${node.id} is ready!`, "success");
    }
}