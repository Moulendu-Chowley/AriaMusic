"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
class GuildList extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "guildlist",
            description: {
                content: "List all guilds the bot is in",
                examples: ["guildlist"],
                usage: "guildlist",
            },
            category: "dev",
            aliases: ["glst"],
            cooldown: 3,
            args: false,
            player: {
                voice: false,
                dj: false,
                active: false,
                djPerm: null,
            },
            permissions: {
                dev: true,
                client: [
                    "SendMessages",
                    "ReadMessageHistory",
                    "ViewChannel",
                    "EmbedLinks",
                ],
                user: [],
            },
            slashCommand: false,
            options: [],
        });
    }
    async run(client, ctx) {
        let allGuilds = [];
        if (client.shard) {
            try {
                const results = await client.shard.broadcastEval((c) => c.guilds.cache.map((g) => ({ name: g.name, id: g.id })));
                allGuilds = results.flat();
            }
            catch {
                allGuilds = client.guilds.cache.map((g) => ({ name: g.name, id: g.id }));
            }
        }
        else {
            allGuilds = client.guilds.cache.map((g) => ({ name: g.name, id: g.id }));
        }
        const guildList = allGuilds.length > 0
            ? allGuilds.map((g) => `- **${g.name}** - ${g.id}`)
            : ["No guilds found."];
        const chunks = client.utils.chunk(guildList, 10) || [[]];
        const pages = chunks.map((chunk, index) => {
            return this.client
                .embed()
                .setColor(this.client.color.main)
                .setDescription(chunk.join("\n"))
                .setFooter({ text: `Page ${index + 1} of ${chunks.length}` });
        });
        await client.utils.paginate(client, ctx, pages);
    }
}
exports.default = GuildList;
