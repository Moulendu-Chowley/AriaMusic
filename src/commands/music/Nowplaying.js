"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
const discord_js_1 = require("discord.js");
class Nowplaying extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "nowplaying",
            description: {
                content: "cmd.nowplaying.description",
                examples: ["nowplaying"],
                usage: "nowplaying",
            },
            category: "music",
            aliases: ["np"],
            cooldown: 3,
            args: false,
            vote: false,
            player: {
                voice: true,
                dj: false,
                active: true,
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
        const player = client.manager.getPlayer(ctx.guild.id);
        if (!player || !player.queue.current) {
            const noMusic = ctx.locale("event.message.no_music_playing");
            const container = new discord_js_1.ContainerBuilder()
                .setAccentColor(this.client.color.red)
                .addSectionComponents(new discord_js_1.SectionBuilder().addTextDisplayComponents((td) => td.setContent(noMusic)));
            return ctx.sendMessage({
                components: [container],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
        }
        const track = player.queue.current;
        const pos = player.position;
        const dur = track.info.duration;
        const bar = client.utils.progressBar(pos, dur, 20);
        const label = ctx.locale("cmd.nowplaying.now_playing");
        const trackInfo = ctx.locale("cmd.nowplaying.track_info", {
            title: track.info.title ?? "N/A",
            uri: track.info.uri ?? "about:blank",
            requester: (() => {
                const r = track.requester;
                if (!r)
                    return "Unknown";
                if (typeof r === "string")
                    return r;
                if (typeof r === "object" && "id" in r && typeof r.id === "string")
                    return r.id;
                return "Unknown";
            })(),
            bar,
        });
        const mainSection = new discord_js_1.SectionBuilder().addTextDisplayComponents((td) => td.setContent(`**${label}**\n${trackInfo}\n\`${client.utils.formatTime(pos)} / ${client.utils.formatTime(dur)}\``));
        if (track.info.artworkUrl) {
            mainSection.setThumbnailAccessory((th) => th
                .setURL(track.info.artworkUrl)
                .setDescription(`Artwork for ${track.info.title ?? "N/A"}`));
        }
        const nowPlayingContainer = new discord_js_1.ContainerBuilder()
            .setAccentColor(this.client.color.main)
            .addSectionComponents(mainSection);
        return ctx.sendMessage({
            components: [nowPlayingContainer],
            flags: discord_js_1.MessageFlags.IsComponentsV2,
        });
    }
}
exports.default = Nowplaying;
