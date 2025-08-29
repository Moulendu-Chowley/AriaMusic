"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../structures/index");
class About extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "about",
            description: {
                content: "cmd.about.description",
                examples: ["about"],
                usage: "about",
            },
            category: "info",
            aliases: ["ab"],
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
        const inviteButton = new discord_js_1.ButtonBuilder()
            .setLabel(ctx.locale("buttons.invite"))
            .setStyle(discord_js_1.ButtonStyle.Link)
            .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands`);
        const supportButton = new discord_js_1.ButtonBuilder()
            .setLabel(ctx.locale("buttons.support"))
            .setStyle(discord_js_1.ButtonStyle.Link)
            .setURL("https://discord.gg/YQsGbTwPBx");
        const row = new discord_js_1.ActionRowBuilder().addComponents(inviteButton, supportButton);
        const embed = this.client
            .embed()
            .setAuthor({
            name: "Aria Music",
            iconURL: "https://media.discordapp.net/attachments/876035356460462090/888434725235097610/20210820_124325.png",
        })
            .setThumbnail("https://media.discordapp.net/attachments/876035356460462090/888434725235097610/20210820_124325.png")
            .setColor(this.client.color.main)
            .addFields({
            name: ctx.locale("cmd.about.fields.creator"),
            value: "Moulendu Chowley",
            inline: true,
        }, {
            name: ctx.locale("cmd.about.fields.repository"),
            value: "[Here](https://github.com/appujet/lavamusic)",
            inline: true,
        }, {
            name: ctx.locale("cmd.about.fields.support"),
            value: "[Here](https://discord.gg/YQsGbTwPBx)",
            inline: true,
        }, {
            name: "\u200b",
            value: ctx.locale("cmd.about.fields.description"),
            inline: true,
        });
        await ctx.sendMessage({
            content: "",
            embeds: [embed],
            components: [row],
        });
    }
}
exports.default = About;
