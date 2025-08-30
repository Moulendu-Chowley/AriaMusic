import { Event } from "../../structures/index.js";

/**
 * Represents a raw event.
 */
export default class Raw extends Event {
    /**
     * @param {import('../../structures/AriaMusic').default} client The custom client instance.
     * @param {string} file The file name of the event.
     */
    constructor(client, file) {
        super(client, file, {
            name: "raw",
        });
        this.client = client;
    }

    /**
     * Runs the event.
     * @param {any} d The raw event data.
     */
    async run(d) {
        this.client.manager.sendRawData(d);
    }
}