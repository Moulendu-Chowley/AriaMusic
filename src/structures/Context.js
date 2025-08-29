"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const env_1 = require("../env");
const I18n_1 = require("./I18n");
class Context {
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
    constructor(ctx, args) {
        this.ctx = ctx;
        this.interaction = ctx instanceof discord_js_1.ChatInputCommandInteraction ? ctx : null;
        this.message = ctx instanceof discord_js_1.Message ? ctx : null;
        this.channel = ctx.channel;
        this.id = ctx.id;
        this.channelId = ctx.channelId;
        this.client = ctx.client;
        this.author = ctx instanceof discord_js_1.Message ? ctx.author : ctx.user;
        this.guild = ctx.guild;
        this.createdAt = ctx.createdAt;
        this.createdTimestamp = ctx.createdTimestamp;
        this.member = ctx.member;
        this.args = args;
        this.setArgs(args);
        this.setUpLocale();
    }
    async setUpLocale() {
        const defaultLanguage = env_1.env.DEFAULT_LANGUAGE || "EnglishUS";
        this.guildLocale = this.guild
            ? await this.client.db.getLanguage(this.guild.id)
            : defaultLanguage;
    }
    get isInteraction() {
        return this.ctx instanceof discord_js_1.ChatInputCommandInteraction;
    }
    setArgs(args) {
        this.args = this.isInteraction
            ? args.map((arg) => arg.value)
            : args;
    }
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
    async sendDeferMessage(content) {
        if (this.isInteraction) {
            await this.interaction?.deferReply();
            this.msg = (await this.interaction?.fetchReply());
            return this.msg;
        }
        this.msg = await (this.message?.channel).send(content);
        return this.msg;
    }
    locale(key, ...args) {
        if (!this.guildLocale)
            this.guildLocale = env_1.env.DEFAULT_LANGUAGE || "EnglishUS";
        return (0, I18n_1.T)(this.guildLocale, key, ...args);
    }
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
    get deferred() {
        return this.isInteraction ? this.interaction?.deferred : !!this.msg;
    }
    options = {
        getRole: (name, required = true) => {
            return this.interaction?.options.get(name, required)?.role;
        },
        getMember: (name, required = true) => {
            return this.interaction?.options.get(name, required)?.member;
        },
        get: (name, required = true) => {
            return this.interaction?.options.get(name, required);
        },
        getChannel: (name, required = true) => {
            return this.interaction?.options.get(name, required)?.channel;
        },
        getSubCommand: () => {
            return this.interaction?.options.data[0].name;
        },
    };
}
exports.default = Context;
function isInteractionReplyOptions(content) {
    return content instanceof Object;
}
function isMessagePayload(content) {
    return content instanceof Object;
}
