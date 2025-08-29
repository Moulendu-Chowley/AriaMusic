"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
class DeletePlaylist extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "delete",
            description: {
                content: "cmd.delete.description",
                examples: ["delete <playlist name>"],
                usage: "delete <playlist name>",
            },
            category: "playlist",
            aliases: ["del"],
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
                    description: "cmd.delete.options.playlist",
                    type: 3,
                    required: true,
                    autocomplete: true,
                },
            ],
        });
    }
    async run(client, ctx, args) {
        const playlistName = args.join(" ").trim();
        const embed = this.client.embed();
        const playlistExists = await client.db.getPlaylist(ctx.author?.id, playlistName);
        if (!playlistExists) {
            return await ctx.sendMessage({
                embeds: [
                    embed
                        .setDescription(ctx.locale("cmd.delete.messages.playlist_not_found"))
                        .setColor(this.client.color.red),
                ],
            });
        }
        await client.db.deleteSongsFromPlaylist(ctx.author?.id, playlistName);
        await client.db.deletePlaylist(ctx.author?.id, playlistName);
        return await ctx.sendMessage({
            embeds: [
                embed
                    .setDescription(ctx.locale("cmd.delete.messages.playlist_deleted", {
                    playlistName,
                }))
                    .setColor(this.client.color.green),
            ],
        });
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
exports.default = DeletePlaylist;
