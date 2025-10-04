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
  constructor(client, options) {
    this.client = client;
    this.name = options.name;
    this.one = options.one ?? false;
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
