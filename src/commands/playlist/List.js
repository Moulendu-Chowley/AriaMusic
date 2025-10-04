import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class List extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "list",
            description: {
                content: "commands.list.description",
                examples: ["list", "list @user"],
                usage: "list [@user]",
            },
            category: "playlist",
            aliases: ["lst"],
            cooldown: 3,
            args: false,
            vote: false,
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
                    name: "user",
                    description: "commands.list.options.user",
                    type: 6,
                    required: false,
                },
            ],
        });
    }

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Content.js').Content} cnt
     */
    async run(client, cnt) {
        try {
            let userId;
            let targetUser = cnt.args[0];

            if (targetUser?.startsWith("<@") && targetUser.endsWith(">")) {
                targetUser = targetUser.slice(2, -1);
                if (targetUser.startsWith("!")) {
                    targetUser = targetUser.slice(1);
                }
                targetUser = await client.users.fetch(targetUser);
                userId = targetUser.id;
            } else if (targetUser) {
                try {
                    targetUser = await client.users.fetch(targetUser);
                    userId = targetUser.id;
                } catch (_error) {
                    const users = client.users.cache.filter(
                        (user) =>
                            user.username.toLowerCase() === targetUser.toLowerCase()
                    );
                    if (users.size > 0) {
                        targetUser = users.first();
                        userId = targetUser?.id ?? null;
                    } else {
                        return await cnt.sendMessage({
                            embeds: [
                                {
                                    description: cnt.get("commands.list.messages.invalid_username"
                                    ),
                                    color: this.client.color.red,
                                },
                            ],
                        });
                    }
                } 
            } else {
                userId = cnt.author?.id;
                targetUser = cnt.author;
            }

            if (!userId) {
                return await cnt.sendMessage({
                    embeds: [
                        {
                            description: cnt.get("commands.list.messages.invalid_userid"
                            ),
                            color: this.client.color.red,
                        },
                    ],
                });
            }

            const playlists = await client.db.getUserPlaylists(userId);
            if (!playlists || playlists.length === 0) {
                return await cnt.sendMessage({
                    embeds: [
                        {
                            description: cnt.get("commands.list.messages.no_playlists"),
                            color: this.client.color.red,
                        },
                    ],
                });
            }

            const targetUsername =
                targetUser
                    ? targetUser.username
                    : cnt.get("commands.list.messages.your");

            return await cnt.sendMessage({
                embeds: [
                    {
                        title: cnt.get("commands.list.messages.playlists_title", {
                            username: targetUsername,
                        }),
                        description: playlists
                            .map((playlist) => playlist.name)
                            .join("\n"),
                        color: this.client.color.main,
                    },
                ],
            });
        } catch (error) {
            client.logger.error(error);
            return await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.list.messages.error"),
                        color: this.client.color.red,
                    },
                ],
            });
        }
    }
}
