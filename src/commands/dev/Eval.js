import util from 'node:util';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { fetch } from 'undici';
import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class Eval extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'eval',
            description: {
                content: 'Evaluate code',
                examples: ['eval'],
                usage: 'eval',
            },
            category: 'dev',
            aliases: ['ev'],
            cooldown: 3,
            args: true,
            player: {
                voice: false,
                dj: false,
                active: false,
                djPerm: null,
            },
            permissions: {
                dev: true,
                client: [
                    'SendMessages',
                    'ReadMessageHistory',
                    'ViewChannel',
                    'EmbedLinks',
                ],
                user: [],
            },
            slashCommand: false,
            options: [],
        });
    }

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Content.js').Content} cnt
     * @param {string[]} args
     */
    async run(client, cnt, args) {
        const code = args.join(' ');
        try {
            let evaled = eval(code);
            if (evaled === client.config) evaled = 'Nice try';
            if (typeof evaled !== 'string') {
                evaled = util.inspect(evaled, { depth: 1 });
            }

            const secrets = [client.token, process.env.TOKEN];
            for (const secret of secrets.filter(Boolean)) {
                evaled = evaled.replaceAll(secret, '[REDACTED]');
            }

            if (evaled.length > 2000) {
                const response = await fetch('https://hasteb.in/post', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                    body: evaled,
                });
                const json = await response.json();
                evaled = `https://hasteb.in/${json.key}`;
                return await cnt.sendMessage({
                    content: evaled,
                });
            }

            const button = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel('Delete')
                .setCustomId('eval-delete');

            const row = new ActionRowBuilder().addComponents(button);

            const msg = await cnt.sendMessage({
                content: `
${evaled}
`,
                components: [row],
            });

            const filter = (i) => i.customId === 'eval-delete' && i.user.id === cnt.author?.id;
            const collector = msg.createMessageComponentCollector({
                time: 60000,
                filter: filter,
            });

            collector.on('collect', async (i) => {
                await i.deferUpdate();
                await msg.delete();
            });
        } catch (e) {
            await cnt.sendMessage(`
${e}
`);
        }
    }
}
