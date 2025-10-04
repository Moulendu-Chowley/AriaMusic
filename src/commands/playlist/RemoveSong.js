import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class RemoveSong extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "removesong",
            description: {
                content: "commands.removesong.description",
                examples: ["removesong <playlist> <song>"],
                usage: "removesong <playlist> <song>",
            },
            category: "playlist",
            aliases: ["rs"],
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
                    description: "commands.removesong.options.playlist",
                    type: 3,
                    required: true,
                    autocomplete: true,
                },
                {
                    name: "song",
                    description: "commands.removesong.options.song",
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
            const errorMessage = this.client
                .embed()
                .setDescription(cnt.get("commands.removesong.messages.provide_playlist"))
                .setColor(this.client.color.red);
            return await cnt.sendMessage({ embeds: [errorMessage] });
        }

        if (!song) {
            const errorMessage = this.client
                .embed()
                .setDescription(cnt.get("commands.removesong.messages.provide_song"))
                .setColor(this.client.color.red);
            return await cnt.sendMessage({ embeds: [errorMessage] });
        }

        const playlistData = await client.db.getPlaylist(cnt.author?.id, playlist);
        if (!playlistData) {
            const playlistNotFoundError = this.client
                .embed()
                .setDescription(
                    cnt.get("commands.removesong.messages.playlist_not_exist")
                )
                .setColor(this.client.color.red);
            return await cnt.sendMessage({ embeds: [playlistNotFoundError] });
        }

        const res = await client.manager.search(song, cnt.author);
        if (!res || (res.loadType !== "track" && res.loadType !== "search")) {
            const noSongsFoundError = this.client
                .embed()
                .setDescription(cnt.get("commands.removesong.messages.song_not_found"))
                .setColor(this.client.color.red);
            return await cnt.sendMessage({ embeds: [noSongsFoundError] });
        }

        const trackToRemove = res.tracks[0];
        try {
            await client.db.removeSong(
                cnt.author.id,
                playlist,
                trackToRemove.encoded
            );
            const successMessage = this.client
                .embed()
                .setDescription(
                    cnt.get("commands.removesong.messages.song_removed", {
                        song: trackToRemove.info.title,
                        playlist: playlistData.name,
                    })
                )
                .setColor(this.client.color.green);
            await cnt.sendMessage({ embeds: [successMessage] });
        } catch (error) {
            console.error(error);
            const genericError = this.client
                .embed()
                .setDescription(cnt.get("commands.removesong.messages.error_occurred"))
                .setColor(this.client.color.red);
            return await cnt.sendMessage({ embeds: [genericError] });
        }
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
        await interaction.respond(
            filtered.slice(0, 25).map((playlist) => ({
                name: playlist.name,
                value: playlist.name,
            }))
        );
    }
}
