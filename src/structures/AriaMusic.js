"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const sdk_1 = require("@top-gg/sdk");
const discord_js_1 = require("discord.js");
const discord_js_2 = require("discord.js");
const config_1 = tslib_1.__importDefault(require("../config"));
const server_1 = tslib_1.__importDefault(require("../database/server"));
const env_1 = require("../env");
const index_1 = tslib_1.__importDefault(require("../plugin/index"));
const Utils_1 = require("../utils/Utils");
const I18n_1 = require("./I18n");
const LavalinkClient_1 = tslib_1.__importDefault(require("./LavalinkClient"));
const Logger_1 = tslib_1.__importDefault(require("./Logger"));
class AriaMusic extends discord_js_1.Client {
    commands = new discord_js_1.Collection();
    aliases = new discord_js_1.Collection();
    db = new server_1.default();
    cooldown = new discord_js_1.Collection();
    config = config_1.default;
    logger = new Logger_1.default();
    emoji = config_1.default.emoji;
    color = config_1.default.color;
    body = [];
    topGG;
    utils = Utils_1.Utils;
    env = env_1.env;
    manager;
    rest = new discord_js_1.REST({ version: "10" }).setToken(env_1.env.TOKEN ?? "");
    embed() {
        return new discord_js_1.EmbedBuilder();
    }
    async start(token) {
        (0, I18n_1.initI18n)();
        if (env_1.env.TOPGG) {
            this.topGG = new sdk_1.Api(env_1.env.TOPGG);
        }
        else {
            this.logger.warn("Top.gg token not found!");
        }
        this.manager = new LavalinkClient_1.default(this);
        await this.loadCommands();
        this.logger.info("Successfully loaded commands!");
        await this.loadEvents();
        this.logger.info("Successfully loaded events!");
        (0, index_1.default)(this);
        await this.login(token);
        this.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
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
    async loadCommands() {
        const commandsPath = node_fs_1.default.readdirSync(node_path_1.default.join(process.cwd(), "src", "commands"));
        for (const dir of commandsPath) {
            const commandFiles = node_fs_1.default
                .readdirSync(node_path_1.default.join(process.cwd(), "src", "commands", dir))
                .filter((file) => file.endsWith(".js"));
            for (const file of commandFiles) {
                const cmdModule = require(node_path_1.default.join(process.cwd(), "src", "commands", dir, file));
                const command = new cmdModule.default(this, file);
                command.category = dir;
                this.commands.set(command.name, command);
                command.aliases.forEach((alias) => {
                    this.aliases.set(alias, command.name);
                });
                if (command.slashCommand) {
                    const data = {
                        name: command.name,
                        description: (0, I18n_1.T)(discord_js_2.Locale.EnglishUS, command.description.content),
                        type: discord_js_1.ApplicationCommandType.ChatInput,
                        options: command.options || [],
                        default_member_permissions: Array.isArray(command.permissions.user) &&
                            command.permissions.user.length > 0
                            ? discord_js_1.PermissionsBitField.resolve(command.permissions.user).toString()
                            : null,
                        name_localizations: null,
                        description_localizations: null,
                    };
                    const localizations = [];
                    I18n_1.i18n.getLocales().map((locale) => {
                        localizations.push((0, I18n_1.localization)(locale, command.name, command.description.content));
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
                            I18n_1.i18n.getLocales().map((locale) => {
                                optionsLocalizations.push((0, I18n_1.localization)(locale, option.name, option.description));
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
                            option.description = (0, I18n_1.T)(discord_js_2.Locale.EnglishUS, option.description);
                        });
                        data.options?.map((option) => {
                            if ("options" in option && option.options.length > 0) {
                                option.options?.map((subOption) => {
                                    const subOptionsLocalizations = [];
                                    I18n_1.i18n.getLocales().map((locale) => {
                                        subOptionsLocalizations.push((0, I18n_1.localization)(locale, subOption.name, subOption.description));
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
                                    subOption.description = (0, I18n_1.T)(discord_js_2.Locale.EnglishUS, subOption.description);
                                });
                            }
                        });
                    }
                    this.body.push(data);
                }
            }
        }
    }
    async deployCommands(guildId) {
        const route = guildId
            ? discord_js_1.Routes.applicationGuildCommands(this.user?.id ?? "", guildId)
            : discord_js_1.Routes.applicationCommands(this.user?.id ?? "");
        try {
            await this.rest.put(route, { body: this.body });
            this.logger.info("Successfully deployed slash commands!");
        }
        catch (error) {
            this.logger.error(error);
        }
    }
    async loadEvents() {
        const eventsPath = node_fs_1.default.readdirSync(node_path_1.default.join(process.cwd(), "src", "events"));
        for (const dir of eventsPath) {
            const eventFiles = node_fs_1.default
                .readdirSync(node_path_1.default.join(process.cwd(), "src", "events", dir))
                .filter((file) => file.endsWith(".js"));
            for (const file of eventFiles) {
                const eventModule = require(node_path_1.default.join(process.cwd(), "src", "events", dir, file));
                const event = new eventModule.default(this, file);
                if (dir === "player") {
                    this.manager.on(event.name, (...args) => event.run(...args));
                }
                else if (dir === "node") {
                    this.manager.nodeManager.on(event.name, (...args) => event.run(...args));
                }
                else {
                    this.on(event.name, (...args) => event.run(...args));
                }
            }
        }
    }
}
exports.default = AriaMusic;
