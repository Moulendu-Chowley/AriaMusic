"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class Command {
    client;
    name;
    name_localizations;
    description;
    description_localizations;
    aliases;
    cooldown;
    args;
    vote;
    player;
    permissions;
    slashCommand;
    options;
    category;
    constructor(client, options) {
        this.client = client;
        this.name = options.name;
        this.name_localizations = options.name_localizations ?? {};
        this.description = {
            content: options.description?.content ?? "No description provided",
            usage: options.description?.usage ?? "No usage provided",
            examples: options.description?.examples ?? ["No examples provided"],
        };
        this.description_localizations = options.description_localizations ?? {};
        this.aliases = options.aliases ?? [];
        this.cooldown = options.cooldown ?? 3;
        this.args = options.args ?? false;
        this.vote = options.vote ?? false;
        this.player = {
            voice: options.player?.voice ?? false,
            dj: options.player?.dj ?? false,
            active: options.player?.active ?? false,
            djPerm: options.player?.djPerm ?? null,
        };
        this.permissions = {
            dev: options.permissions?.dev ?? false,
            client: options.permissions?.client ?? [
                discord_js_1.PermissionFlagsBits.SendMessages,
                discord_js_1.PermissionFlagsBits.ViewChannel,
                discord_js_1.PermissionFlagsBits.EmbedLinks,
            ],
            user: options.permissions?.user ?? [],
        };
        this.slashCommand = options.slashCommand ?? false;
        this.options = options.options ?? [];
        this.category = options.category ?? "general";
    }
    async run(_client, _message, _args) {
        return await Promise.resolve();
    }
    async autocomplete(_interaction) {
        return await Promise.resolve();
    }
}
exports.default = Command;
