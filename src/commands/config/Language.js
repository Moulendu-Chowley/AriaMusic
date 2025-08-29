"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("../../env");
const index_1 = require("../../structures/index");
const types_1 = require("../../types");
class LanguageCommand extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "language",
            description: {
                content: "cmd.language.description",
                examples: ["language set `EnglishUS`", "language reset"],
                usage: "language",
            },
            category: "config",
            aliases: ["lang"],
            cooldown: 3,
            args: true,
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
                user: ["ManageGuild"],
            },
            slashCommand: true,
            options: [
                {
                    name: "set",
                    description: "cmd.language.options.set",
                    type: 1,
                    options: [
                        {
                            name: "language",
                            description: "cmd.language.options.language",
                            type: 3,
                            required: true,
                            autocomplete: true,
                        },
                    ],
                },
                {
                    name: "reset",
                    description: "cmd.language.options.reset",
                    type: 1,
                },
            ],
        });
    }
    async run(client, ctx, args) {
        let subCommand;
        if (ctx.isInteraction) {
            subCommand = ctx.options.getSubCommand();
        }
        else {
            subCommand = args.shift();
        }
        const defaultLanguage = env_1.env.DEFAULT_LANGUAGE || types_1.Language.EnglishUS;
        if (subCommand === "set") {
            const embed = client.embed().setColor(this.client.color.main);
            const locale = (await client.db.getLanguage(ctx.guild.id)) || defaultLanguage;
            let lang;
            if (ctx.isInteraction) {
                lang = ctx.options.get("language")?.value;
            }
            else {
                lang = args[0];
            }
            if (!Object.values(types_1.Language).includes(lang)) {
                const availableLanguages = Object.entries(types_1.LocaleFlags)
                    .map(([key, value]) => `${value}:\`${key}\``)
                    .reduce((acc, curr, index) => {
                    if (index % 2 === 0) {
                        return (acc +
                            curr +
                            (index === Object.entries(types_1.LocaleFlags).length - 1 ? "" : " "));
                    }
                    return `${acc + curr}\n`;
                }, "");
                return ctx.sendMessage({
                    embeds: [
                        embed.setDescription(ctx.locale("cmd.language.invalid_language", {
                            languages: availableLanguages,
                        })),
                    ],
                });
            }
            if (locale && locale === lang) {
                return ctx.sendMessage({
                    embeds: [
                        embed.setDescription(ctx.locale("cmd.language.already_set", {
                            language: lang,
                        })),
                    ],
                });
            }
            await client.db.updateLanguage(ctx.guild.id, lang);
            ctx.guildLocale = lang;
            return ctx.sendMessage({
                embeds: [
                    embed.setDescription(ctx.locale("cmd.language.set", { language: lang })),
                ],
            });
        }
        if (subCommand === "reset") {
            const embed = client.embed().setColor(this.client.color.main);
            const locale = await client.db.getLanguage(ctx.guild.id);
            if (!locale) {
                return ctx.sendMessage({
                    embeds: [embed.setDescription(ctx.locale("cmd.language.not_set"))],
                });
            }
            await client.db.updateLanguage(ctx.guild.id, defaultLanguage);
            ctx.guildLocale = defaultLanguage;
            return ctx.sendMessage({
                embeds: [embed.setDescription(ctx.locale("cmd.language.reset"))],
            });
        }
    }
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const languages = Object.values(types_1.Language).map((language) => ({
            name: language,
            value: language,
        }));
        const filtered = languages.filter((language) => language.name.toLowerCase().includes(focusedValue.toLowerCase()));
        await interaction.respond(filtered.slice(0, 25)).catch(console.error);
    }
}
exports.default = LanguageCommand;
