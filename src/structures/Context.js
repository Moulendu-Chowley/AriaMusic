import { ChatInputCommandInteraction, Message } from "discord.js";
import { env } from "../env.js";
import { T } from "./I18n.js";

/**
 * Checks if the content is an InteractionReplyOptions object.
 * @param {any} content The content to check.
 * @returns {boolean}
 */
function isInteractionReplyOptions(content) {
    return content instanceof Object;
}

/**
 * Checks if the content is a MessagePayload object.
 * @param {any} content The content to check.
 * @returns {boolean}
 */
function isMessagePayload(content) {
    return content instanceof Object;
}

/**
 * Represents a command context.
 */
export default class Context {
    ctx;
    interaction;
    message;
    id;
    channelId;
    client;
    author;
    channel;
    guild;
    createdAt;
    createdTimestamp;
    member;
    args;
    msg;
    guildLocale;

    /**
     * @param {ChatInputCommandInteraction | Message} ctx The context of the command.
     * @param {any[]} args The command arguments.
     */
    constructor(ctx, args) {
        this.ctx = ctx;
        this.interaction = ctx instanceof ChatInputCommandInteraction ? ctx : null;
        this.message = ctx instanceof Message ? ctx : null;
        this.channel = ctx.channel;
        this.id = ctx.id;
        this.channelId = ctx.channelId;
        this.client = ctx.client;
        this.author = ctx instanceof Message ? ctx.author : ctx.user;
        this.guild = ctx.guild;
        this.createdAt = ctx.createdAt;
        this.createdTimestamp = ctx.createdTimestamp;
        this.member = ctx.member;
        this.args = args;
        this.setArgs(args);
        this.setUpLocale();
    }

    /**
     * Sets up the locale for the context.
     */
    async setUpLocale() {
        const defaultLanguage = env.DEFAULT_LANGUAGE || "EnglishUS";
        this.guildLocale = this.guild
            ? await this.client.db.getLanguage(this.guild.id)
            : defaultLanguage;
    }

    /**
     * Checks if the context is an interaction.
     * @returns {boolean}
     */
    get isInteraction() {
        return this.ctx instanceof ChatInputCommandInteraction;
    }

    /**
     * Sets the arguments for the context.
     * @param {any[]} args The arguments to set.
     */
    setArgs(args) {
        this.args = this.isInteraction
            ? args.map((arg) => arg.value)
            : args;
    }

    /**
     * Sends a message.
     * @param {string | InteractionReplyOptions | MessagePayload} content The content to send.
     * @returns {Promise<Message>}
     */
    async sendMessage(content) {
        if (this.isInteraction) {
            if (typeof content === "string" || isInteractionReplyOptions(content)) {
                this.msg = await this.interaction?.reply(content);
                return this.msg;
            }
        }
        else if (typeof content === "string" || isMessagePayload(content)) {
            this.msg = await (this.message?.channel).send(content);
            return this.msg;
        }
        return this.msg;
    }

    /**
     * Edits a message.
     * @param {string | InteractionReplyOptions | MessagePayload} content The content to edit.
     * @returns {Promise<Message>}
     */
    async editMessage(content) {
        if (this.isInteraction && this.msg) {
            this.msg = await this.interaction?.editReply(content);
            return this.msg;
        }
        if (this.msg) {
            this.msg = await this.msg.edit(content);
            return this.msg;
        }
        return this.msg;
    }

    /**
     * Sends a deferred message.
     * @param {string | InteractionReplyOptions | MessagePayload} content The content to send.
     * @returns {Promise<Message>}
     */
    async sendDeferMessage(content) {
        if (this.isInteraction) {
            await this.interaction?.deferReply();
            this.msg = (await this.interaction?.fetchReply());
            return this.msg;
        }
        this.msg = await (this.message?.channel).send(content);
        return this.msg;
    }

    /**
     * Gets a localized string.
     * @param {string} key The key of the string.
     * @param {...any} args The arguments for the string.
     * @returns {string}
     */
    locale(key, ...args) {
        if (!this.guildLocale)
            this.guildLocale = env.DEFAULT_LANGUAGE || "EnglishUS";
        return T(this.guildLocale, key, ...args);
    }

    /**
     * Sends a follow-up message.
     * @param {string | InteractionReplyOptions | MessagePayload} content The content to send.
     */
    async sendFollowUp(content) {
        if (this.isInteraction) {
            if (typeof content === "string" || isInteractionReplyOptions(content)) {
                await this.interaction?.followUp(content);
            }
        }
        else if (typeof content === "string" || isMessagePayload(content)) {
            this.msg = await (this.message?.channel).send(content);
        }
    }

    /**
     * Checks if the context is deferred.
     * @returns {boolean}
     */
    get deferred() {
        return this.isInteraction ? this.interaction?.deferred : !!this.msg;
    }

    options = {
        /**
         * Gets a role option.
         * @param {string} name The name of the option.
         * @param {boolean} [required=true] Whether the option is required.
         * @returns {import('discord.js').Role}
         */
        getRole: (name, required = true) => {
            return this.interaction?.options.get(name, required)?.role;
        },
        /**
         * Gets a member option.
         * @param {string} name The name of the option.
         * @param {boolean} [required=true] Whether the option is required.
         * @returns {import('discord.js').GuildMember}
         */
        getMember: (name, required = true) => {
            return this.interaction?.options.get(name, required)?.member;
        },
        /**
         * Gets an option.
         * @param {string} name The name of the option.
         * @param {boolean} [required=true] Whether the option is required.
         * @returns {any}
         */
        get: (name, required = true) => {
            return this.interaction?.options.get(name, required);
        },
        /**
         * Gets a channel option.
         * @param {string} name The name of the option.
         * @param {boolean} [required=true] Whether the option is required.
         * @returns {import('discord.js').TextChannel}
         */
        getChannel: (name, required = true) => {
            return this.interaction?.options.get(name, required)?.channel;
        },
        /**
         * Gets the sub-command.
         * @returns {string}
         */
        getSubCommand: () => {
            return this.interaction?.options.data[0].name;
        },
    };
}