import { Command } from "../../structures/index.js";
import { applyFairPlayToQueue } from "../../utils/functions/player.js";

/**
 * @extends Command
 */
export default class Play extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "play",
            description: {
                content: "cmd.play.description",
                examples: [
                    "play example",
                    "play https://www.youtube.com/watch?v=example",
                    "play https://open.spotify.com/track/example",
                    "play http://www.example.com/example.mp3",
                ],
                usage: "play <song>",
            },
            category: "music",
            aliases: ["p"],
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
                    description: "cmd.play.options.song",
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
        const query = ctx.isInteraction
            ? ctx.interaction.options.getString("song")
            : args.join(" ");
        await ctx.sendDeferMessage(ctx.locale("cmd.play.loading"));

        let player = client.manager.getPlayer(ctx.guild.id);
        const memberVoiceChannel = ctx.member.voice.channel;

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

        const response = await player.search({ query: query }, ctx.author);
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

        await player.queue.add(
            response.loadType === "playlist" ? response.tracks : response.tracks[0]
        );

        const fairPlayEnabled = player.get("fairplay");
        if (fairPlayEnabled) {
            await applyFairPlayToQueue(player);
        }

        if (response.loadType === "playlist") {
            await ctx.editMessage({
                content: "",
                embeds: [
                    embed.setColor(this.client.color.main).setDescription(
                        ctx.locale("cmd.play.added_playlist_to_queue", {
                            length: response.tracks.length,
                        })
                    ),
                ],
            });
        } else {
            await ctx.editMessage({
                content: "",
                embeds: [
                    embed.setColor(this.client.color.main).setDescription(
                        ctx.locale("cmd.play.added_to_queue", {
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