"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
class RemoveSong extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "removesong",
            description: {
                content: "cmd.removesong.description",
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
                    description: "cmd.removesong.options.playlist",
                    type: 3,
                    required: true,
                    autocomplete: true,
                },
                {
                    name: "song",
                    description: "cmd.removesong.options.song",
                    type: 3,
                    required: true,
                },
            ],
        });
    }
    async run(client, ctx, args) {
        const playlist = args.shift();
        const song = args.join(" ");
        if (!playlist) {
            const errorMessage = this.client
                .embed()
                .setDescription(ctx.locale("cmd.removesong.messages.provide_playlist"))
                .setColor(this.client.color.red);
            return await ctx.sendMessage({ embeds: [errorMessage] });
        }
        if (!song) {
            const errorMessage = this.client
                .embed()
                .setDescription(ctx.locale("cmd.removesong.messages.provide_song"))
                .setColor(this.client.color.red);
            return await ctx.sendMessage({ embeds: [errorMessage] });
        }
        const playlistData = await client.db.getPlaylist(ctx.author?.id, playlist);
        if (!playlistData) {
            const playlistNotFoundError = this.client
                .embed()
                .setDescription(ctx.locale("cmd.removesong.messages.playlist_not_exist"))
                .setColor(this.client.color.red);
            return await ctx.sendMessage({ embeds: [playlistNotFoundError] });
        }
        const res = await client.manager.search(song, ctx.author);
        if (!res || (res.loadType !== "track" && res.loadType !== "search")) {
            const noSongsFoundError = this.client
                .embed()
                .setDescription(ctx.locale("cmd.removesong.messages.song_not_found"))
                .setColor(this.client.color.red);
            return await ctx.sendMessage({ embeds: [noSongsFoundError] });
        }
        const trackToRemove = res.tracks[0];
        try {
            await client.db.removeSong(ctx.author.id, playlist, trackToRemove.encoded);
            const successMessage = this.client
                .embed()
                .setDescription(ctx.locale("cmd.removesong.messages.song_removed", {
                song: trackToRemove.info.title,
                playlist: playlistData.name,
            }))
                .setColor(this.client.color.green);
            await ctx.sendMessage({ embeds: [successMessage] });
        }
        catch (error) {
            console.error(error);
            const genericError = this.client
                .embed()
                .setDescription(ctx.locale("cmd.removesong.messages.error_occurred"))
                .setColor(this.client.color.red);
            return await ctx.sendMessage({ embeds: [genericError] });
        }
    }
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const userId = interaction.user.id;
        const playlists = await this.client.db.getUserPlaylists(userId);
        const filtered = playlists.filter((playlist) => playlist.name.toLowerCase().startsWith(focusedValue.toLowerCase()));
        await interaction.respond(filtered.slice(0, 25).map((playlist) => ({
            name: playlist.name,
            value: playlist.name,
        })));
    }
}
exports.default = RemoveSong;
