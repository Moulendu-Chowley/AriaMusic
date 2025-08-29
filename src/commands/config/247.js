"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
class _247 extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "247",
            description: {
                content: "cmd.247.description",
                examples: ["247"],
                usage: "247",
            },
            category: "config",
            aliases: ["stay"],
            cooldown: 3,
            args: false,
            vote: true,
            player: {
                voice: true,
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
            options: [],
        });
    }
    async run(client, ctx) {
        const embed = this.client.embed();
        let player = client.manager.getPlayer(ctx.guild.id);
        try {
            const data = await client.db.get_247(ctx.guild.id);
            const member = ctx.member;
            if (!member?.voice?.channel) {
                return await ctx.sendMessage({
                    embeds: [
                        embed
                            .setDescription(ctx.locale("cmd.247.errors.not_in_voice"))
                            .setColor(client.color.red),
                    ],
                });
            }
            if (data) {
                await client.db.delete_247(ctx.guild.id);
                return await ctx.sendMessage({
                    embeds: [
                        embed
                            .setDescription(ctx.locale("cmd.247.messages.disabled"))
                            .setColor(client.color.red),
                    ],
                });
            }
            await client.db.set_247(ctx.guild.id, ctx.channel.id, member.voice.channel.id);
            if (!player) {
                player = client.manager.createPlayer({
                    guildId: ctx.guild.id,
                    voiceChannelId: member.voice.channel.id,
                    textChannelId: ctx.channel.id,
                    selfMute: false,
                    selfDeaf: true,
                    vcRegion: member.voice.channel.rtcRegion ?? undefined,
                });
            }
            if (!player.connected)
                await player.connect();
            return await ctx.sendMessage({
                embeds: [
                    embed
                        .setDescription(ctx.locale("cmd.247.messages.enabled"))
                        .setColor(this.client.color.main),
                ],
            });
        }
        catch (error) {
            client.logger.error("Error in 247 command:", error);
            return await ctx.sendMessage({
                embeds: [
                    embed
                        .setDescription(ctx.locale("cmd.247.errors.generic"))
                        .setColor(client.color.red),
                ],
            });
        }
    }
}
exports.default = _247;
