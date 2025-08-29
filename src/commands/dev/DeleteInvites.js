"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
class DestroyInvites extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "destroyinvites",
            description: {
                content: "Destroy all invite links created by the bot in a guild",
                examples: ["destroyinvites 0000000000000000000"],
                usage: "destroyinvites <guildId>",
            },
            category: "dev",
            aliases: ["di"],
            cooldown: 3,
            args: true,
            player: {
                voice: false,
                dj: false,
                active: false,
                djPerm: null,
            },
            permissions: {
                dev: true,
                client: [
                    "SendMessages",
                    "ManageGuild",
                    "ReadMessageHistory",
                    "ViewChannel",
                ],
                user: [],
            },
            slashCommand: false,
            options: [],
        });
    }
    async run(client, ctx, args) {
        const guild = client.guilds.cache.get(args[0]);
        if (!guild) {
            return await ctx.sendMessage("Guild not found.");
        }
        try {
            const botInvites = (await guild.invites.fetch()).filter((invite) => invite.inviter?.id === client.user?.id);
            await Promise.all(botInvites.map((invite) => invite.delete()));
            return await ctx.sendMessage(`Destroyed ${botInvites.size} invite(s) created by the bot.`);
        }
        catch {
            return await ctx.sendMessage("Failed to destroy invites.");
        }
    }
}
exports.default = DestroyInvites;
