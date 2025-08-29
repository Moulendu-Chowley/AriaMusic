"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
class Prefix extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "prefix",
            description: {
                content: "cmd.prefix.description",
                examples: ["prefix set !", "prefix reset"],
                usage: "prefix",
            },
            category: "general",
            aliases: ["pf"],
            cooldown: 3,
            args: true,
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
                user: ["ManageGuild"],
            },
            slashCommand: true,
            options: [
                {
                    name: "set",
                    description: "cmd.prefix.options.set",
                    type: 1,
                    options: [
                        {
                            name: "prefix",
                            description: "cmd.prefix.options.prefix",
                            type: 3,
                            required: true,
                        },
                    ],
                },
                {
                    name: "reset",
                    description: "cmd.prefix.options.reset",
                    type: 1,
                },
            ],
        });
    }
    async run(client, ctx, args) {
        const embed = client.embed().setColor(this.client.color.main);
        const guildId = ctx.guild.id;
        const guildData = await client.db.get(guildId);
        const isInteraction = ctx.isInteraction;
        let subCommand;
        let prefix;
        if (isInteraction) {
            subCommand = ctx.options.getSubCommand();
            prefix = ctx.options.get("prefix")?.value?.toString();
        }
        else {
            subCommand = args[0] || "";
            prefix = args[1] || "";
        }
        switch (subCommand) {
            case "set": {
                if (!prefix) {
                    const currentPrefix = guildData
                        ? guildData.prefix
                        : client.env.PREFIX;
                    embed.setDescription(ctx.locale("cmd.prefix.messages.current_prefix", {
                        prefix: currentPrefix,
                    }));
                    return await ctx.sendMessage({ embeds: [embed] });
                }
                if (prefix.length > 3) {
                    embed.setDescription(ctx.locale("cmd.prefix.errors.prefix_too_long"));
                    return await ctx.sendMessage({ embeds: [embed] });
                }
                await client.db.setPrefix(guildId, prefix);
                embed.setDescription(ctx.locale("cmd.prefix.messages.prefix_set", { prefix }));
                return await ctx.sendMessage({ embeds: [embed] });
            }
            case "reset": {
                const defaultPrefix = client.env.PREFIX;
                await client.db.setPrefix(guildId, defaultPrefix);
                embed.setDescription(ctx.locale("cmd.prefix.messages.prefix_reset", {
                    prefix: defaultPrefix,
                }));
                return await ctx.sendMessage({ embeds: [embed] });
            }
            default: {
                const currentPrefix = guildData ? guildData.prefix : client.env.PREFIX;
                embed.setDescription(ctx.locale("cmd.prefix.messages.current_prefix", {
                    prefix: currentPrefix,
                }));
                return await ctx.sendMessage({ embeds: [embed] });
            }
        }
    }
}
exports.default = Prefix;
