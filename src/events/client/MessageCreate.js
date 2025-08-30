import { Collection, PermissionsBitField } from "discord.js";
import { Event, Context } from "../../structures/index.js";
import { T } from "../../structures/I18n.js";

/**
 * @extends {Event}
 */
export default class MessageCreate extends Event {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'messageCreate',
            once: false,
        });
    }

    /**
     * @param {import('discord.js').Message} message
     */
    async run(message) {
        if (message.author.bot) return;

        const prefix = await this.client.db.getPrefix(message.guildId);
        const mention = new RegExp(`^<@!?${this.client.user.id}>( |)$`);

        if (message.content.match(mention)) {
            const embed = this.client
                .embed()
                .setTitle('Aria Music')
                .setDescription(
                    `My prefix is **${prefix}**\n\nTo see a list of commands, type **${prefix}help**`
                )
                .setColor(this.client.color.main);
            return message.reply({ embeds: [embed] });
        }

        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const prefixRegex = new RegExp(
            `^(<@!?${this.client.user.id}>|${escapeRegex(prefix)})\\s*`
        );

        if (!prefixRegex.test(message.content)) return;

        const [, matchedPrefix] = message.content.match(prefixRegex);
        const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command =
            this.client.commands.get(commandName) ||
            this.client.commands.get(this.client.aliases.get(commandName));

        if (!command) return;

        const ctx = new Context(message, args);
        ctx.setLocale(await this.client.db.getLanguage(message.guildId));

        if (
            !message.guild.members.me
                .permissions.has(PermissionsBitField.resolve(["SendMessages"]))
        ) {
            return await message.author.send(
                `I don't have **Send Messages** permission in ${message.guild.name} to execute this **${command.name}** command.`
            );
        }

        if (
            !message.guild.members.me
                .permissions.has(PermissionsBitField.resolve(["ViewChannel"]))
        ) {
            return;
        }

        if (
            !message.guild.members.me
                .permissions.has(PermissionsBitField.resolve(["EmbedLinks"]))
        ) {
            return await message.reply(
                `I don't have **Embed Links** permission to execute this **${command.name}** command.`
            );
        }

        if (command.permissions.user.length > 0) {
            if (
                !message.member.permissions.has(
                    PermissionsBitField.resolve(command.permissions.user)
                )
            ) {
                const requiredPerms = command.permissions.user.map((p) => `"${p}"`).join(', ');
                const embed = this.client
                    .embed()
                    .setDescription(
                        `You need ${requiredPerms} permissions to use this command.`
                    )
                    .setColor(this.client.color.red);
                return await ctx.sendMessage({ embeds: [embed] });
            }
        }

        if (command.permissions.dev) {
            if (!this.client.env.OWNER_IDS.includes(message.author.id)) {
                return;
            }
        }

        if (command.player.voice) {
            if (!message.member.voice.channel) {
                const embed = this.client
                    .embed()
                    .setDescription(T(ctx.locale, 'player.voice_channel_error'))
                    .setColor(this.client.color.red);
                return await ctx.sendMessage({ embeds: [embed] });
            }
        }

        if (command.player.active) {
            if (!this.client.manager.getPlayer(message.guildId)) {
                const embed = this.client
                    .embed()
                    .setDescription(T(ctx.locale, 'player.no_music_playing_error'))
                    .setColor(this.client.color.red);
                return await ctx.sendMessage({ embeds: [embed] });
            }
        }

        if (command.player.dj) {
            const djRole = await this.client.db.getDj(message.guildId);
            if (djRole && djRole.mode) {
                const djRoles = await this.client.db.getRoles(message.guildId);
                if (
                    !message.member.roles.cache.has(djRole.role) &&
                    !djRoles.map((r) => r.roleId).includes(message.member.roles.cache.first().id)
                ) {
                    const embed = this.client
                        .embed()
                        .setDescription(T(ctx.locale, 'player.dj_only_error'))
                        .setColor(this.client.color.red);
                    return await ctx.sendMessage({ embeds: [embed] });
                }
            }
        }

        if (command.args) {
            if (!args.length) {
                const embed = this.client
                    .embed()
                    .setTitle(T(ctx.locale, 'misc.invalid_usage'))
                    .setDescription(`"${prefix}${command.name} ${command.description.usage}" `)
                    .setColor(this.client.color.red);
                return await ctx.sendMessage({ embeds: [embed] });
            }
        }

        if (!this.client.cooldown.has(command.name)) {
            this.client.cooldown.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = this.client.cooldown.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                const embed = this.client
                    .embed()
                    .setDescription(
                        T(ctx.locale, 'misc.cooldown_error', {
                            time: timeLeft.toFixed(1),
                        })
                    )
                    .setColor(this.client.color.red);
                return await ctx.sendMessage({ embeds: [embed] });
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        try {
            await command.run(this.client, ctx, args);
        } catch (error) {
            this.client.logger.error(error);
            const embed = this.client
                .embed()
                .setDescription(T(ctx.locale, 'misc.error_occurred'))
                .setColor(this.client.color.red);
            await ctx.sendMessage({ embeds: [embed] });
        }
    }
}