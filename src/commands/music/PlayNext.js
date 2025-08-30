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
                content: "cmd.playnext.description",
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
                    description: "cmd.playnext.options.song",
                    type: 3,
                    required: true,
                    autocomplete: true,
                },
            ],
        });
    }

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Context.js').Context} ctx
     * @param {string[]} args
     */
    async run(client, ctx, args) {
        const query = args.join(" ");
        let player = client.manager.getPlayer(ctx.guild.id);
        const memberVoiceChannel = ctx.member.voice?.channel;

        if (!memberVoiceChannel) {
            return await ctx.editMessage({
                content: ctx.locale("player.errors.user_not_in_voice_channel"),
            });
        }

        if (!player)
            player = client.manager.createPlayer({
                guildId: ctx.guild.id,
                voiceChannelId: memberVoiceChannel.id,
                textChannelId: ctx.channel.id,
                selfMute: false,
                selfDeaf: true,
                vcRegion: memberVoiceChannel.rtcRegion,
            });

        if (!player.connected) await player.connect();

        await ctx.sendDeferMessage(ctx.locale("cmd.playnext.loading"));

        let response;
        try {
            response = await player.search({ query }, ctx.author);
        } catch (err) {
            return await ctx.editMessage({
                content: "",
                embeds: [
                    this.client
                        .embed()
                        .setColor(this.client.color.red)
                        .setDescription(ctx.locale("cmd.play.errors.search_error")),
                ],
            });
        }

        const embed = this.client.embed();
        if (!response || response.tracks?.length === 0) {
            return await ctx.editMessage({
                content: "",
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(ctx.locale("cmd.play.errors.search_error")),
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
            await ctx.editMessage({
                content: "",
                embeds: [
                    embed
                        .setColor(this.client.color.main)
                        .setDescription(
                            ctx.locale("cmd.playnext.added_playlist_to_play_next", {
                                length: response.tracks.length,
                            })
                        ),
                ],
            });
        } else {
            await ctx.editMessage({
                content: "",
                embeds: [
                    embed
                        .setColor(this.client.color.main)
                        .setDescription(
                            ctx.locale("cmd.playnext.added_to_play_next", {
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