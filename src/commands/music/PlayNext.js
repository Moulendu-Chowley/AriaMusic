import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class PlayNext extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "playnext",
            description: {
                content: "commands.playnext.description",
                examples: [
                    "playnext example",
                    "playnext https://www.youtube.com/watch?v=example",
                    "playnext https://open.spotify.com/track/example",
                    "playnext http://www.example.com/example.mp3",
                ],
                usage: "playnext <song>",
            },
            category: "music",
            aliases: ["pn"],
            cooldown: 3,
            args: true,
            vote: false,
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
                    name: "song",
                    description: "commands.playnext.options.song",
                    type: 3,
                    required: true,
                    autocomplete: true,
                },
            ],
        });
    }

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Content.js').Content} cnt
     * @param {string[]} args
     */
    async run(client, cnt, args) {
        const query = args.join(" ");
        let player = client.manager.getPlayer(cnt.guild.id);
        const memberVoiceChannel = cnt.member.voice?.channel;

        if (!memberVoiceChannel) {
            return await cnt.editMessage({
                content: cnt.get("player.errors.user_not_in_voice_channel"),
            });
        }

        if (!player)
            player = client.manager.createPlayer({
                guildId: cnt.guild.id,
                voiceChannelId: memberVoiceChannel.id,
                textChannelId: cnt.channel.id,
                selfMute: false,
                selfDeaf: true,
                vcRegion: memberVoiceChannel.rtcRegion,
            });

        if (!player.connected) await player.connect();

        await cnt.sendDeferMessage(cnt.get("commands.playnext.loading"));

        let response;
        try {
            response = await player.search({ query }, cnt.author);
        } catch (err) {
            return await cnt.editMessage({
                content: "",
                embeds: [
                    this.client
                        .embed()
                        .setColor(this.client.color.red)
                        .setDescription(cnt.get("commands.play.errors.search_error")),
                ],
            });
        }

        const embed = this.client.embed();
        if (!response || response.tracks?.length === 0) {
            return await cnt.editMessage({
                content: "",
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(cnt.get("commands.play.errors.search_error")),
                ],
            });
        }

        await player.queue.splice(
            0,
            0,
            ...(response.loadType === "playlist"
                ? response.tracks
                : [response.tracks[0]])
        );

        if (response.loadType === "playlist") {
            await cnt.editMessage({
                content: "",
                embeds: [
                    embed
                        .setColor(this.client.color.main)
                        .setDescription(
                            cnt.get("commands.playnext.added_playlist_to_play_next", {
                                length: response.tracks.length,
                            })
                        ),
                ],
            });
        } else {
            await cnt.editMessage({
                content: "",
                embeds: [
                    embed
                        .setColor(this.client.color.main)
                        .setDescription(
                            cnt.get("commands.playnext.added_to_play_next", {
                                title: response.tracks[0].info.title,
                                uri: response.tracks[0].info.uri,
                            })
                        ),
                ],
            });
        }

        if (!player.playing && player.queue.tracks.length > 0)
            await player.play({ paused: false });
    }

    /**
     * @param {import('discord.js').AutocompleteInteraction} interaction
     */
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused(true);
        if (!focusedValue?.value.trim()) {
            return interaction.respond([]);
        }

        const res = await this.client.manager.search(
            focusedValue.value.trim(),
            interaction.user
        );
        const songs = [];

        if (res.loadType === "search") {
            res.tracks.slice(0, 10).forEach((track) => {
                const name = `${track.info.title} by ${track.info.author}`;
                songs.push({
                    name: name.length > 100 ? `${name.substring(0, 97)}...` : name,
                    value: track.info.uri,
                });
            });
        }

        return await interaction.respond(songs);
    }
}
