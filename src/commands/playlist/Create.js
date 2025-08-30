import { Prisma } from "@prisma/client";
import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Create extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "create",
            description: {
                content: "cmd.create.description",
                examples: ["create <name>"],
                usage: "create <name>",
            },
            category: "playlist",
            aliases: ["cre"],
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
                    name: "name",
                    description: "cmd.create.options.name",
                    type: 3,
                    required: true,
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
        const name = args.join(" ").trim();
        const embed = this.client.embed();
        const normalizedName = name.toLowerCase();

        if (!name.length) {
            return await ctx.sendMessage({
                embeds: [
                    embed
                        .setDescription(ctx.locale("cmd.create.messages.name_empty"))
                        .setColor(this.client.color.red),
                ],
            });
        }

        if (name.length > 50) {
            return await ctx.sendMessage({
                embeds: [
                    embed
                        .setDescription(ctx.locale("cmd.create.messages.name_too_long"))
                        .setColor(this.client.color.red),
                ],
            });
        }

        const playlistExists = await client.db.getPlaylist(
            ctx.author?.id,
            normalizedName
        );

        if (playlistExists) {
            return await ctx.sendMessage({
                embeds: [
                    embed
                        .setDescription(
                            ctx.locale("cmd.create.messages.playlist_exists")
                        )
                        .setColor(this.client.color.red),
                ],
            });
        }

        try {
            await client.db.createPlaylist(ctx.author?.id, normalizedName);
        } catch (error) {
            if (
                typeof Prisma !== "undefined" &&
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                return await ctx.sendMessage({
                    embeds: [
                        embed
                            .setDescription(
                                ctx.locale("cmd.create.messages.playlist_exists")
                            )
                            .setColor(this.client.color.red),
                    ],
                });
            }
            throw error;
        }

        return await ctx.sendMessage({
            embeds: [
                embed
                    .setDescription(
                        ctx.locale("cmd.create.messages.playlist_created", {
                            name,
                        })
                    )
                    .setColor(this.client.color.green),
            ],
        });
    }
}