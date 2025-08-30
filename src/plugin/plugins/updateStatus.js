import { Events } from 'discord.js';

/**
 * @type {import('../../types.js').Plugin}
 */
const updateStatusPlugin = {
    name: 'Update Status Plugin',
    version: '1.0.0',
    author: 'Appu',
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    initialize: (client) => {
        client.on(Events.ClientReady, () => client.utils.updateStatus(client));
    },
};

export default updateStatusPlugin;