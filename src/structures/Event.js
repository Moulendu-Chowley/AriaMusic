/**
 * Represents an event.
 */
export default class Event {
    client;
    one;
    file;
    name;
    fileName;

    /**
     * @param {import('./AriaMusic').default} client The custom client instance.
     * @param {string} file The file name of the event.
     * @param {object} options The event options.
     */
    constructor(client, file, options) {
        this.client = client;
        this.file = file;
        this.name = options.name;
        this.one = options.one ?? false;
        this.fileName = file.split(".")[0];
    }

    /**
     * Runs the event.
     * @param {...any} _args The event arguments.
     * @returns {Promise<any>}
     */
    async run(..._args) {
        return await Promise.resolve();
    }
}