import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class PlayLocal extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "playlocal",
            description: {
                content: "commands.playlocal.description",
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
                    description: "commands.playlocal.options.file",
                    type: ApplicationCommandOptionType.Attachment,
                    required: true,
                },
            ],
        });
    }

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Content.js').Content} cnt
     */
    async run(client, cnt) {
        const attachment = cnt.isInteraction
            ? cnt.interaction.options.get("file")?.attachment
            : cnt.message?.attachments.first();

        if (!attachment) {
            return cnt.sendMessage({
                embeds: [
                    this.client
                        .embed()
                        .setColor(this.client.color.red)
                        .setDescription(cnt.get("commands.playlocal.errors.empty_query")),
                ],
            });
        }

        const audioExtensions = [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"];
        const extension = attachment.name.split(".").pop()?.toLowerCase();

        if (!audioExtensions.includes(`.${extension}`)) {
            return cnt.sendMessage({
                embeds: [
                    this.client
                        .embed()
                        .setColor(this.client.color.red)
                        .setDescription(
                            cnt.get("commands.playlocal.errors.invalid_format")
                        ),
                ],
            });
        }

        await cnt.sendDeferMessage(cnt.get("commands.playlocal.loading"));

        let player = client.manager.getPlayer(cnt.guild.id);
        if (!player) {
            const memberVoiceChannel = cnt.member?.voice.channel;
            if (!memberVoiceChannel) {
                return cnt.sendMessage({
                    embeds: [
                        this.client
                            .embed()
                            .setColor(this.client.color.red)
                            .setDescription(
                                cnt.get("player.errors.user_not_in_voice_channel")
                            ),
                    ],
                });
            }
            player = client.manager.createPlayer({
                guildId: cnt.guild.id,
                voiceChannelId: memberVoiceChannel.id,
                textChannelId: cnt.channel.id,
                selfMute: false,
                selfDeaf: true,
                vcRegion: memberVoiceChannel.rtcRegion ?? undefined,
            });
        }

        if (!player.connected) await player.connect();

        const response = await player
            .search(
                {
                    query: attachment.url,
                    source: "local",
                },
                cnt.author
            )
            .catch(() => null);

        if (!response || !response.tracks?.length) {
            return cnt.editMessage({
                content: " ",
                embeds: [
                    this.client
                        .embed()
                        .setColor(this.client.color.red)
                        .setDescription(cnt.get("commands.playlocal.errors.no_results")),
                ],
            });
        }

        await player.queue.add(response.tracks[0]);

        await cnt.editMessage({
            content: "",
            embeds: [
                this.client
                    .embed()
                    .setColor(this.client.color.main)
                    .setDescription(
                        cnt.get("commands.playlocal.added_to_queue", {
                            title: attachment.name,
                            url: attachment.url,
                        })
                    ),
            ],
        });

        if (!player.playing && player.queue.tracks.length > 0) await player.play();
    }
}
