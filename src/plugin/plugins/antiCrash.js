/**
 * @type {import('../../types.js').Plugin}
 */
const antiCrash = {
    name: 'AntiCrash Plugin',
    version: '1.0.0',
    author: 'Appu',
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    initialize: (client) => {
        const handleExit = async () => {
            if (client) {
                client.logger.star('Disconnecting from Discord...');
                await client.destroy();
                client.logger.success('Successfully disconnected from Discord!');
                process.exit();
            }
        };

        process.on('unhandledRejection', (reason, promise) => {
            client.logger.error(
                'Unhandled Rejection at:',
                promise,
                'reason:',
                reason
            );
        });

        process.on('uncaughtException', (err) => {
            client.logger.error('Uncaught Exception thrown:', err);
        });

        process.on('SIGINT', handleExit);
        process.on('SIGTERM', handleExit);
        process.on('SIGQUIT', handleExit);
    },
};

export default antiCrash;