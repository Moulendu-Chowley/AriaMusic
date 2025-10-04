import { Command } from "../../structures/index.js";
import {
    ContainerBuilder,
    MessageFlags,
    SectionBuilder,
} from "discord.js";

/**
 * @extends Command
 */
export default class Nowplaying extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "nowplaying",
            description: {
                content: "commands.nowplaying.description",
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

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Content.js').Content} cnt
     */
    async run(client, cnt) {
        const player = client.manager.getPlayer(cnt.guild.id);
        if (!player || !player.queue.current) {
            const noMusic = cnt.get("events.message.no_music_playing");
            const container = new ContainerBuilder()
                .setAccentColor(this.client.color.red)
                .addSectionComponents(
                    new SectionBuilder().addTextDisplayComponents((td) =>
                        td.setContent(noMusic)
                    )
                );
            return cnt.sendMessage({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        const track = player.queue.current;
        const pos = player.position;
        const dur = track.info.duration;
        const bar = client.utils.progressBar(pos, dur, 20);
        const label = cnt.get("commands.nowplaying.now_playing");
        const trackInfo = cnt.get("commands.nowplaying.track_info", {
            title: track.info.title ?? "N/A",
            uri: track.info.uri ?? "about:blank",
            requester: (() => {
                const r = track.requester;
                if (!r) return "Unknown";
                if (typeof r === "string") return r;
                if (typeof r === "object" && "id" in r && typeof r.id === "string")
                    return r.id;
                return "Unknown";
            })(),
            bar,
        });

        const mainSection = new SectionBuilder().addTextDisplayComponents((td) =>
            td.setContent(
                `**${label}**\n${trackInfo}\n${client.utils.formatTime(
                    pos
                )} / ${client.utils.formatTime(dur)}`
            )
        );

        if (track.info.artworkUrl) {
            mainSection.setThumbnailAccessory((th) =>
                th
                    .setURL(track.info.artworkUrl)
                    .setDescription(`Artwork for ${track.info.title ?? "N/A"}`)
            );
        }

        const nowPlayingContainer = new ContainerBuilder()
            .setAccentColor(this.client.color.main)
            .addSectionComponents(mainSection);

        return cnt.sendMessage({
            components: [nowPlayingContainer],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
