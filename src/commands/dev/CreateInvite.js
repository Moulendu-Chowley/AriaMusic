"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../structures/index");
class CreateInvite extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "createinvite",
            description: {
                content: "Create an invite link for a guild",
                examples: ["createinvite 0000000000000000000"],
                usage: "createinvite <guildId>",
            },
            category: "dev",
            aliases: ["ci", "gi", "ginvite", "guildinvite"],
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
                    "CreateInstantInvite",
                    "ReadMessageHistory",
                    "EmbedLinks",
                    "ViewChannel",
                ],
                user: [],
            },
            slashCommand: false,
            options: [],
        });
    }
    async run(client, ctx, args) {
        const guild = client.guilds.cache.get(args[0]);
        if (!guild) {
            return await ctx.sendMessage({
                embeds: [
                    this.client
                        .embed()
                        .setColor(this.client.color.red)
                        .setDescription("Guild not found"),
                ],
            });
        }
        const textChannel = guild.channels.cache.find((c) => c.type === discord_js_1.ChannelType.GuildText &&
            c
                .permissionsFor(guild.members.me)
                ?.has(discord_js_1.PermissionFlagsBits.CreateInstantInvite |
                discord_js_1.PermissionFlagsBits.SendMessages |
                discord_js_1.PermissionFlagsBits.ViewChannel));
        if (!textChannel) {
            return await ctx.sendMessage({
                embeds: [
                    this.client
                        .embed()
                        .setColor(this.client.color.red)
                        .setDescription("No suitable channel found"),
                ],
            });
        }
        const invite = await textChannel.createInvite({
            maxAge: 3600,
            maxUses: 0,
            reason: `Requested by developer: ${ctx.author?.username}`,
        });
        return await ctx.sendMessage({
            embeds: [
                this.client
                    .embed()
                    .setColor(this.client.color.main)
                    .setDescription(`Invite link for ${guild.name}: [Link](${invite.url})`),
            ],
        });
    }
}
exports.default = CreateInvite;
