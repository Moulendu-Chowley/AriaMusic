"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_os_1 = tslib_1.__importDefault(require("node:os"));
const discord_js_1 = require("discord.js");
const node_system_stats_1 = require("node-system-stats");
const index_1 = require("../../structures/index");
class Botinfo extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "botinfo",
            description: {
                content: "cmd.botinfo.description",
                examples: ["botinfo"],
                usage: "botinfo",
            },
            category: "info",
            aliases: ["bi", "info", "stats", "status"],
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
                    "SendMessages",
                    "ReadMessageHistory",
                    "ViewChannel",
                    "EmbedLinks",
                ],
                user: [],
            },
            slashCommand: true,
            options: [],
        });
    }
    async run(client, ctx) {
        const osInfo = `${node_os_1.default.type()} ${node_os_1.default.release()}`;
        const osUptime = client.utils.formatTime(node_os_1.default.uptime());
        const osHostname = node_os_1.default.hostname();
        const cpuInfo = `${node_os_1.default.arch()} (${node_os_1.default.cpus().length} cores)`;
        const cpuUsed = (await (0, node_system_stats_1.usagePercent)({ coreIndex: 0, sampleMs: 2000 }))
            .percent;
        const memTotal = (0, node_system_stats_1.showTotalMemory)(true);
        const memUsed = (process.memoryUsage().rss / 1024 ** 2).toFixed(2);
        const nodeVersion = process.version;
        const discordJsVersion = discord_js_1.version;
        const commands = client.commands.size;
        const promises = [
            client.shard?.broadcastEval((client) => client.guilds.cache.size),
            client.shard?.broadcastEval((client) => client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
            client.shard?.broadcastEval((client) => client.channels.cache.size),
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
                cpuUsed,
                memUsed,
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
exports.default = Botinfo;
