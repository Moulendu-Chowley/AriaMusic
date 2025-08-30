import os from 'node:os';
import { version as djsVersion } from 'discord.js';
import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class Botinfo extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'botinfo',
            description: {
                content: 'cmd.botinfo.description',
                examples: ['botinfo'],
                usage: 'botinfo',
            },
            category: 'info',
            aliases: ['bi', 'info', 'stats', 'status'],
            cooldown: 3,
            args: false,
            vote: false,
            player: {
                voice: false,
                dj: false,
                active: false,
                djPerm: null,
            },
            permissions: {
                dev: false,
                client: [
                    'SendMessages',
                    'ReadMessageHistory',
                    'ViewChannel',
                    'EmbedLinks',
                ],
                user: [],
            },
            slashCommand: true,
            options: [],
        });
    }

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Context.js').Context} ctx
     */
    async run(client, ctx) {
        const osInfo = `${os.type()} ${os.release()}`;
        const osUptime = client.utils.formatTime(os.uptime());
        const osHostname = os.hostname();
        const cpuInfo = `${os.arch()} (${os.cpus().length} cores)`;

        // ✅ CPU usage (approximate % using loadavg)
        const cpuLoad = os.loadavg()[0]; // 1 min avg
        const cpuPercent = ((cpuLoad / os.cpus().length) * 100).toFixed(1);

        // ✅ Memory usage
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        const memTotal = (totalMem / 1024 ** 3).toFixed(2) + ' GB';
        const memUsed = (usedMem / 1024 ** 3).toFixed(2) + ' GB';
        const memPercent = ((usedMem / totalMem) * 100).toFixed(1) + '%';

        const nodeVersion = process.version;
        const discordJsVersion = djsVersion;
        const commands = client.commands.size;

        const promises = [
            client.shard?.broadcastEval((c) => c.guilds.cache.size),
            client.shard?.broadcastEval((c) =>
                c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
            ),
            client.shard?.broadcastEval((c) => c.channels.cache.size),
        ];

        return Promise.all(promises).then(async (results) => {
            const guilds = results[0]?.reduce((acc, guildCount) => acc + guildCount, 0);
            const users = results[1]?.reduce((acc, memberCount) => acc + memberCount, 0);
            const channels = results[2]?.reduce((acc, channelCount) => acc + channelCount, 0);

            const botInfo = ctx.locale("cmd.botinfo.content", {
                osInfo,
                osUptime,
                osHostname,
                cpuInfo,
                cpuUsed: cpuPercent + "%",
                memUsed: `${memUsed} (${memPercent})`,
                memTotal,
                nodeVersion,
                discordJsVersion,
                guilds,
                channels,
                users,
                commands,
            });

            const embed = this.client
                .embed()
                .setColor(this.client.color.main)
                .setDescription(botInfo);

            return await ctx.sendMessage({
                embeds: [embed],
            });
        });
    }
}