"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../structures/index");
class Invite extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "invite",
            description: {
                content: "cmd.invite.description",
                examples: ["invite"],
                usage: "invite",
            },
            category: "info",
            aliases: ["iv"],
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
            options: [],
        });
    }
    async run(client, ctx) {
        const embed = this.client.embed();
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setLabel(ctx.locale("buttons.invite"))
            .setStyle(discord_js_1.ButtonStyle.Link)
            .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands`), new discord_js_1.ButtonBuilder()
            .setLabel(ctx.locale("buttons.support"))
            .setStyle(discord_js_1.ButtonStyle.Link)
            .setURL("https://discord.gg/YQsGbTwPBx"));
        return await ctx.sendMessage({
            embeds: [
                embed
                    .setColor(this.client.color.main)
                    .setDescription(ctx.locale("cmd.invite.content")),
            ],
            components: [row],
        });
    }
}
exports.default = Invite;
