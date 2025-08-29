"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_util_1 = tslib_1.__importDefault(require("node:util"));
const discord_js_1 = require("discord.js");
const undici_1 = require("undici");
const index_1 = require("../../structures/index");
class Eval extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "eval",
            description: {
                content: "Evaluate code",
                examples: ["eval"],
                usage: "eval",
            },
            category: "dev",
            aliases: ["ev"],
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
    async run(client, ctx, args) {
        const code = args.join(" ");
        try {
            let evaled = eval(code);
            if (evaled === client.config)
                evaled = "Nice try";
            if (typeof evaled !== "string") {
                evaled = node_util_1.default.inspect(evaled, { depth: 1 });
            }
            const secrets = [client.token, process.env.TOKEN];
            for (const secret of secrets.filter(Boolean)) {
                evaled = evaled.replaceAll(secret, "[REDACTED]");
            }
            if (evaled.length > 2000) {
                const response = await (0, undici_1.fetch)("https://hasteb.in/post", {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain",
                    },
                    body: evaled,
                });
                const json = await response.json();
                evaled = `https://hasteb.in/${json.key}`;
                return await ctx.sendMessage({
                    content: evaled,
                });
            }
            const button = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setLabel("Delete")
                .setCustomId("eval-delete");
            const row = new discord_js_1.ActionRowBuilder().addComponents(button);
            const msg = await ctx.sendMessage({
                content: `\`\`\`js\n${evaled}\n\`\`\``,
                components: [row],
            });
            const filter = (i) => i.customId === "eval-delete" && i.user.id === ctx.author?.id;
            const collector = msg.createMessageComponentCollector({
                time: 60000,
                filter: filter,
            });
            collector.on("collect", async (i) => {
                await i.deferUpdate();
                await msg.delete();
            });
        }
        catch (e) {
            await ctx.sendMessage(`\`\`\`js\n${e}\n\`\`\``);
        }
    }
}
exports.default = Eval;
