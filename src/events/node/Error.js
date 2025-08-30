import { Event } from "../../structures/index.js";
import { sendLog } from "../../utils/BotLog.js";

/**
 * Represents an error event.
 */
export default class ErrorEvent extends Event {
    /**
     * @param {import('../../structures/AriaMusic').default} client The custom client instance.
     * @param {string} file The file name of the event.
     */
    constructor(client, file) {
        super(client, file, {
            name: "error",
        });
    }

    /**
     * Runs the event.
     * @param {import('lavalink-client').LavalinkNode} node The Lavalink node that encountered an error.
     * @param {Error} error The error that was encountered.
     */
    async run(node, error) {
        this.client.logger.error(`Node ${node.id} error: ${error.stack || error.message}`);
        sendLog(this.client, `Node ${node.id} encountered an error: ${error.stack || error.message}`, "error");
    }
}