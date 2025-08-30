import { PermissionFlagsBits } from "discord.js";

/**
 * Represents a command.
 */
export default class Command {
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

    /**
     * @param {import('./AriaMusic').default} client The custom client instance.
     * @param {object} options The command options.
     */
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
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.EmbedLinks,
            ],
            user: options.permissions?.user ?? [],
        };
        this.slashCommand = options.slashCommand ?? false;
        this.options = options.options ?? [];
        this.category = options.category ?? "general";
    }

    /**
     * Runs the command.
     * @param {import('./AriaMusic').default} _client The custom client instance.
     * @param {import('discord.js').Message} _message The message that triggered the command.
     * @param {string[]} _args The command arguments.
     * @returns {Promise<any>}
     */
    async run(_client, _message, _args) {
        return await Promise.resolve();
    }

    /**
     * Handles autocomplete for the command.
     * @param {import('discord.js').AutocompleteInteraction} _interaction The autocomplete interaction.
     * @returns {Promise<any>}
     */
    async autocomplete(_interaction) {
        return await Promise.resolve();
    }
}