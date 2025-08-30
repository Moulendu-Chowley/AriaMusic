import fs from "node:fs";
import path from "node:path";
import { Api } from "@top-gg/sdk";
import { Client, Collection, REST, Routes, ApplicationCommandType, PermissionsBitField, Events, EmbedBuilder, Locale } from "discord.js";
import config from "../config.js";
import Database from "../database/server.js";
import { env } from "../env.js";
import loadPlugins from "../plugin/index.js";
import { Utils } from "../utils/Utils.js";
import { initI18n, T, localization, i18n } from "./I18n.js";
import LavalinkClient from "./LavalinkClient.js";
import Logger from "./Logger.js";

/**
 * Represents the main client.
 */
export default class AriaMusic extends Client {
    commands = new Collection();
    aliases = new Collection();
    db = new Database();
    cooldown = new Collection();
    config = config;
    logger = new Logger();
    emoji = config.emoji;
    color = config.color;
    body = [];
    topGG;
    utils = Utils;
    env = env;
    manager;
    rest = new REST({ version: "10" }).setToken(env.TOKEN ?? "");

    /**
     * Creates an embed builder.
     * @returns {EmbedBuilder}
     */
    embed() {
        return new EmbedBuilder();
    }

    /**
     * Starts the client.
     * @param {string} token The bot token.
     */
    async start(token) {
        initI18n();
        if (env.TOPGG) {
            this.topGG = new Api(env.TOPGG);
        } else {
            this.logger.warn("Top.gg token not found!");
        }
        this.manager = new LavalinkClient(this);
        await this.loadCommands();
        this.logger.info("Successfully loaded commands!");
        await this.loadEvents();
        this.logger.info("Successfully loaded events!");
        loadPlugins(this);
        await this.login(token);

        this.on(Events.InteractionCreate, async (interaction) => {
            if (interaction.isButton() && interaction.guildId) {
                const setup = await this.db.getSetup(interaction.guildId);
                if (setup &&
                    interaction.channelId === setup.textId &&
                    interaction.message.id === setup.messageId) {
                    this.emit("setupButtons", interaction);
                }
            }
        });
    }

    /**
     * Loads all commands.
     */
    async loadCommands() {
        const commandsPath = fs.readdirSync(path.join(process.cwd(), "src", "commands"));
        for (const dir of commandsPath) {
            const commandFiles = fs
                .readdirSync(path.join(process.cwd(), "src", "commands", dir))
                .filter((file) => file.endsWith(".js"));
            for (const file of commandFiles) {
                const cmdModule = require(path.join(process.cwd(), "src", "commands", dir, file));
                const command = new cmdModule.default(this, file);
                command.category = dir;
                this.commands.set(command.name, command);
                command.aliases.forEach((alias) => {
                    this.aliases.set(alias, command.name);
                });

                if (command.slashCommand) {
                    const data = {
                        name: command.name,
                        description: T(Locale.EnglishUS, command.description.content),
                        type: ApplicationCommandType.ChatInput,
                        options: command.options || [],
                        default_member_permissions: Array.isArray(command.permissions.user) &&
                            command.permissions.user.length > 0
                            ? PermissionsBitField.resolve(command.permissions.user).toString()
                            : null,
                        name_localizations: null,
                        description_localizations: null,
                    };

                    const localizations = [];
                    i18n.getLocales().map((locale) => {
                        localizations.push(localization(locale, command.name, command.description.content));
                    });

                    for (const localization of localizations) {
                        const [language, name] = localization.name;
                        const [language2, description] = localization.description;
                        data.name_localizations = {
                            ...data.name_localizations,
                            [language]: name,
                        };
                        data.description_localizations = {
                            ...data.description_localizations,
                            [language2]: description,
                        };
                    }

                    if (command.options.length > 0) {
                        command.options.map((option) => {
                            const optionsLocalizations = [];
                            i18n.getLocales().map((locale) => {
                                optionsLocalizations.push(localization(locale, option.name, option.description));
                            });

                            for (const localization of optionsLocalizations) {
                                const [language, name] = localization.name;
                                const [language2, description] = localization.description;
                                option.name_localizations = {
                                    ...option.name_localizations,
                                    [language]: name,
                                };
                                option.description_localizations = {
                                    ...option.description_localizations,
                                    [language2]: description,
                                };
                            }
                            option.description = T(Locale.EnglishUS, option.description);
                        });

                        data.options?.map((option) => {
                            if ("options" in option && option.options.length > 0) {
                                option.options?.map((subOption) => {
                                    const subOptionsLocalizations = [];
                                    i18n.getLocales().map((locale) => {
                                        subOptionsLocalizations.push(localization(locale, subOption.name, subOption.description));
                                    });

                                    for (const localization of subOptionsLocalizations) {
                                        const [language, name] = localization.name;
                                        const [language2, description] = localization.description;
                                        subOption.name_localizations = {
                                            ...subOption.name_localizations,
                                            [language]: name,
                                        };
                                        subOption.description_localizations = {
                                            ...subOption.description_localizations,
                                            [language2]: description,
                                        };
                                    }
                                    subOption.description = T(Locale.EnglishUS, subOption.description);
                                });
                            }
                        });
                    }
                    this.body.push(data);
                }
            }
        }
    }

    /**
     * Deploys all commands.
     * @param {string} [guildId] The ID of the guild to deploy the commands to.
     */
    async deployCommands(guildId) {
        const route = guildId
            ? Routes.applicationGuildCommands(this.user?.id ?? "", guildId)
            : Routes.applicationCommands(this.user?.id ?? "");
        try {
            await this.rest.put(route, { body: this.body });
            this.logger.info("Successfully deployed slash commands!");
        } catch (error) {
            this.logger.error(error);
        }
    }

    /**
     * Loads all events.
     */
    async loadEvents() {
        const eventsPath = fs.readdirSync(path.join(process.cwd(), "src", "events"));
        for (const dir of eventsPath) {
            const eventFiles = fs
                .readdirSync(path.join(process.cwd(), "src", "events", dir))
                .filter((file) => file.endsWith(".js"));
            for (const file of eventFiles) {
                const eventModule = require(path.join(process.cwd(), "src", "events", dir, file));
                const event = new eventModule.default(this, file);
                if (dir === "player") {
                    this.manager.on(event.name, (...args) => event.run(...args));
                } else if (dir === "node") {
                    this.manager.nodeManager.on(event.name, (...args) => event.run(...args));
                } else {
                    this.on(event.name, (...args) => event.run(...args));
                }
            }
        }
    }
}