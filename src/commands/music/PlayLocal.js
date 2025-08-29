"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../structures/index");
class PlayLocal extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "playlocal",
            description: {
                content: "cmd.playlocal.description",
                examples: ["playlocal <file>"],
                usage: "playlocal <file>",
            },
            category: "music",
            aliases: ["pf", "pl"],
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
                    "Connect",
                    "Speak",
                ],
                user: [],
            },
            slashCommand: true,
            options: [
                {
                    name: "file",
                    description: "cmd.playlocal.options.file",
                    type: discord_js_1.ApplicationCommandOptionType.Attachment,
                    required: true,
                },
            ],
        });
    }
    async run(client, ctx) {
        const attachment = ctx.isInteraction
            ? ctx.interaction.options.get("file")?.attachment
            : ctx.message?.attachments.first();
        if (!attachment) {
            return ctx.sendMessage({
                embeds: [
                    this.client
                        .embed()
                        .setColor(this.client.color.red)
                        .setDescription(ctx.locale("cmd.playlocal.errors.empty_query")),
                ],
            });
        }
        const audioExtensions = [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"];
        const extension = attachment.name.split(".").pop()?.toLowerCase();
        if (!audioExtensions.includes(`.${extension}`)) {
            return ctx.sendMessage({
                embeds: [
                    this.client
                        .embed()
                        .setColor(this.client.color.red)
                        .setDescription(ctx.locale("cmd.playlocal.errors.invalid_format")),
                ],
            });
        }
        await ctx.sendDeferMessage(ctx.locale("cmd.playlocal.loading"));
        let player = client.manager.getPlayer(ctx.guild.id);
        if (!player) {
            const memberVoiceChannel = ctx.member?.voice.channel;
            if (!memberVoiceChannel) {
                return ctx.sendMessage({
                    embeds: [
                        this.client
                            .embed()
                            .setColor(this.client.color.red)
                            .setDescription(ctx.locale("player.errors.user_not_in_voice_channel")),
                    ],
                });
            }
            player = client.manager.createPlayer({
                guildId: ctx.guild.id,
                voiceChannelId: memberVoiceChannel.id,
                textChannelId: ctx.channel.id,
                selfMute: false,
                selfDeaf: true,
                vcRegion: memberVoiceChannel.rtcRegion ?? undefined,
            });
        }
        if (!player.connected)
            await player.connect();
        const response = (await player
            .search({
            query: attachment.url,
            source: "local",
        }, ctx.author)
            .catch(() => null));
        if (!response || !response.tracks?.length) {
            return ctx.editMessage({
                content: " ",
                embeds: [
                    this.client
                        .embed()
                        .setColor(this.client.color.red)
                        .setDescription(ctx.locale("cmd.playlocal.errors.no_results")),
                ],
            });
        }
        await player.queue.add(response.tracks[0]);
        await ctx.editMessage({
            content: "",
            embeds: [
                this.client
                    .embed()
                    .setColor(this.client.color.main)
                    .setDescription(ctx.locale("cmd.playlocal.added_to_queue", {
                    title: attachment.name,
                    url: attachment.url,
                })),
            ],
        });
        if (!player.playing && player.queue.tracks.length > 0)
            await player.play();
    }
}
exports.default = PlayLocal;
