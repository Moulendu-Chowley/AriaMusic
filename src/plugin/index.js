import fs from 'node:fs';
import path from 'node:path';

const pluginsFolder = path.join(process.cwd(), 'src', 'plugin', 'plugins');

/**
 * @param {import('../structures/AriaMusic.js').AriaMusic} client
 */
export default async function loadPlugins(client) {
    try {
        const pluginFiles = fs
            .readdirSync(pluginsFolder)
            .filter((file) => file.endsWith('.js'));

        for (const file of pluginFiles) {
            const pluginPath = path.join(pluginsFolder, file);
            const { default: plugin } = await import(pluginPath);

            if (plugin.initialize) {
                plugin.initialize(client);
            }
            client.logger.info(`Loaded plugin: ${plugin.name} v${plugin.version}`);
        }
    } catch (error) {
        client.logger.error('Error loading plugins:', error);
    }
}