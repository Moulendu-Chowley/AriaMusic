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
                content: "commands.create.description",
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
                    description: "commands.create.options.name",
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
        const name = args.join(" ").trim();
        const embed = this.client.embed();
        const normalizedName = name.toLowerCase();

        if (!name.length) {
            return await cnt.sendMessage({
                embeds: [
                    embed
                        .setDescription(cnt.get("commands.create.messages.name_empty"))
                        .setColor(this.client.color.red),
                ],
            });
        }

        if (name.length > 50) {
            return await cnt.sendMessage({
                embeds: [
                    embed
                        .setDescription(cnt.get("commands.create.messages.name_too_long"))
                        .setColor(this.client.color.red),
                ],
            });
        }

        const playlistExists = await client.db.getPlaylist(
            cnt.author?.id,
            normalizedName
        );

        if (playlistExists) {
            return await cnt.sendMessage({
                embeds: [
                    embed
                        .setDescription(
                            cnt.get("commands.create.messages.playlist_exists")
                        )
                        .setColor(this.client.color.red),
                ],
            });
        }

        try {
            await client.db.createPlaylist(cnt.author?.id, normalizedName);
        } catch (error) {
            if (
                typeof Prisma !== "undefined" &&
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                return await cnt.sendMessage({
                    embeds: [
                        embed
                            .setDescription(
                                cnt.get("commands.create.messages.playlist_exists")
                            )
                            .setColor(this.client.color.red),
                    ],
                });
            }
            throw error;
        }

        return await cnt.sendMessage({
            embeds: [
                embed
                    .setDescription(
                        cnt.get("commands.create.messages.playlist_created", {
                            name,
                        })
                    )
                    .setColor(this.client.color.green),
            ],
        });
    }
}
