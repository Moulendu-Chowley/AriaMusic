import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class AddSong extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "addsong",
            description: {
                content: "commands.addsong.description",
                examples: [
                    "addsong test exemple",
                    "addsong exemple https://www.youtube.com/watch?v=example",
                ],
                usage: "addsong <playlist> <song>",
            },
            category: "playlist",
            aliases: ["as"],
            cooldown: 3,
            args: true,
            vote: true,
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
                user: [],
            },
            slashCommand: true,
            options: [
                {
                    name: "playlist",
                    description: "commands.addsong.options.playlist",
                    type: 3,
                    required: true,
                    autocomplete: true,
                },
                {
                    name: "song",
                    description: "commands.addsong.options.song",
                    type: 3,
                    required: true,
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
        const playlist = args.shift();
        const song = args.join(" ");

        if (!playlist) {
            return await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.addsong.messages.no_playlist"),
                        color: this.client.color.red,
                    },
                ],
            });
        }

        if (!song) {
            return await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.addsong.messages.no_song"),
                        color: this.client.color.red,
                    },
                ],
            });
        }

        const res = await client.manager.search(song, cnt.author);
        if (!res) {
            return await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.addsong.messages.no_songs_found"),
                        color: this.client.color.red,
                    },
                ],
            });
        }

        const playlistData = await client.db.getPlaylist(cnt.author?.id, playlist);
        if (!playlistData) {
            return await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.addsong.messages.playlist_not_found"
                        ),
                        color: this.client.color.red,
                    },
                ],
            });
        }

        let trackStrings;
        let count = 0;
        if (res.loadType === "playlist") {
            trackStrings = res.tracks.map((track) => track.encoded);
            count = res.tracks.length;
        } else if (res.loadType === "track") {
            trackStrings = [res.tracks[0].encoded];
            count = 1;
        } else if (res.loadType === "search") {
            trackStrings = [res.tracks[0].encoded];
            count = 1;
        }

        await client.db.addTracksToPlaylist(
            cnt.author?.id,
            playlist,
            trackStrings
        );

        return await cnt.sendMessage({
            embeds: [
                {
                    description: cnt.get("commands.addsong.messages.added", {
                        playlist: playlistData.name,
                        count,
                    }),
                    color: this.client.color.green,
                },
            ],
        });
    }

    /**
     * @param {import('discord.js').AutocompleteInteraction} interaction
     */
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const userId = interaction.user.id;
        const playlists = await this.client.db.getUserPlaylists(userId);
        const filtered = playlists.filter((playlist) =>
            playlist.name.toLowerCase().startsWith(focusedValue.toLowerCase())
        );
        return await interaction.respond(
            filtered.slice(0, 25).map((playlist) => ({
                name: playlist.name,
                value: playlist.name,
            }))
        );
    }
}
