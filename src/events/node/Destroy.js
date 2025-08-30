import { Event } from "../../structures/index.js";
import { sendLog } from "../../utils/BotLog.js";

/**
 * Represents a destroy event.
 */
export default class Destroy extends Event {
    /**
     * @param {import('../../structures/AriaMusic').default} client The custom client instance.
     * @param {string} file The file name of the event.
     */
    constructor(client) {
        super(client, {
            name: "destroy",
        });
    }

    /**
     * Runs the event.
     * @param {import('lavalink-client').LavalinkNode} node The Lavalink node that was destroyed.
     * @param {string} destroyReason The reason why the node was destroyed.
     */
    async run(node, destroyReason) {
        this.client.logger.success(`Node ${node.id} is destroyed!`);
        sendLog(this.client, `Node ${node.id} is destroyed: ${destroyReason}`, "warn");
    }
}