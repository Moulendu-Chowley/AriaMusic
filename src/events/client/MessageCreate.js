import { Collection, PermissionsBitField } from "discord.js";
import { Content, Event } from "../../structures/index.js";

/**
 * @extends {Event}
 */
export default class MessageCreate extends Event {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: "messageCreate",
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
        .setTitle("Aria Music")
        .setDescription(
          `Hey, my prefix for this server is \`${prefix}\`. Want more info? then do \`${prefix}help\`\nDiscover. Play. Vibe!`
        )
        .setColor(this.client.color.main);
      return message.reply({ embeds: [embed] });
    }

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\\\]]/g, "\\$&");
    const prefixRegex = new RegExp(
      `^(<@!?${this.client.user.id}>|${escapeRegex(prefix)})\\s*`
    );

    // Check if user has no-prefix permission
    const isNoPrefixUser = await this.client.db.isNoPrefixUser(
      message.author.id
    );

    let matchedPrefix = "";
    let args = [];
    let commandName = "";

    if (prefixRegex.test(message.content)) {
      // Standard prefix command
      [, matchedPrefix] = message.content.match(prefixRegex);
      args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
      commandName = args.shift().toLowerCase();
    } else if (isNoPrefixUser) {
      // No-prefix command for authorized users
      args = message.content.trim().split(/ +/);
      commandName = args.shift().toLowerCase();
    } else {
      // No prefix match and not a no-prefix user
      return;
    }

    const command =
      this.client.commands.get(commandName) ||
      this.client.commands.get(this.client.aliases.get(commandName));

    if (!command) return;

    const cnt = new Content(message, args);

    if (
      !message.guild.members.me.permissions.has(
        PermissionsBitField.resolve(["SendMessages"])
      )
    ) {
      return await message.author.send(
        cnt.get("events.message.no_send_message")
      );
    }

    if (
      !message.guild.members.me.permissions.has(
        PermissionsBitField.resolve(["ViewChannel"])
      )
    ) {
      return;
    }

    if (
      !message.guild.members.me.permissions.has(
        PermissionsBitField.resolve(["EmbedLinks"])
      )
    ) {
      return await message.reply(
        cnt.get("events.message.no_permission", {
          permissions: "**`EmbedLinks`**",
        })
      );
    }

    if (command.permissions.user.length > 0) {
      if (
        !message.member.permissions.has(
          PermissionsBitField.resolve(command.permissions.user)
        )
      ) {
        const requiredPerms = command.permissions.user
          .map((p) => `"${p}"`)
          .join(", ");
        const embed = this.client
          .embed()
          .setDescription(cnt.get("events.message.no_user_permission"))
          .setColor(this.client.color.red);
        return await cnt.sendMessage({ embeds: [embed] });
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
          .setDescription(
            cnt.get("events.message.no_voice_channel", {
              command: command.name,
            })
          )
          .setColor(this.client.color.red);
        return await cnt.sendMessage({ embeds: [embed] });
      }
    }

    if (command.player.active) {
      if (!this.client.manager.getPlayer(message.guildId)) {
        const embed = this.client
          .embed()
          .setDescription(cnt.get("events.message.no_music_playing"))
          .setColor(this.client.color.red);
        return await cnt.sendMessage({ embeds: [embed] });
      }
    }

    if (command.player.dj) {
      const djRole = await this.client.db.getDj(message.guildId);
      if (djRole && djRole.mode) {
        const djRoles = await this.client.db.getRoles(message.guildId);
        if (
          !message.member.roles.cache.has(djRole.role) &&
          !djRoles
            .map((r) => r.roleId)
            .includes(message.member.roles.cache.first().id)
        ) {
          const embed = this.client
            .embed()
            .setDescription(cnt.get("events.message.no_dj_permission"))
            .setColor(this.client.color.red);
          return await cnt.sendMessage({ embeds: [embed] });
        }
      }
    }

    if (command.args) {
      if (!args.length) {
        const embed = this.client
          .embed()
          .setTitle(cnt.get("events.message.missing_arguments"))
          .setDescription(
            cnt.get("events.message.missing_arguments_description", {
              command: command.name,
              usage: command.description.usage
                ? Array.isArray(command.description.usage)
                  ? command.description.usage
                      .map((u) => `\`${prefix}${u}\``)
                      .join("\n")
                  : `\`${prefix}${command.description.usage}\``
                : `\`${prefix}${command.name}\``,
              examples: command.description.examples
                ? Array.isArray(command.description.examples)
                  ? command.description.examples
                      .map((ex) => `\`${prefix}${ex}\``)
                      .join("\n")
                  : `\`${prefix}${command.description.examples}\``
                : `\`${prefix}${command.name}\``,
            })
          )
          .setFooter({ text: cnt.get("events.message.syntax_footer") })
          .setColor(this.client.color.red);
        return await cnt.sendMessage({ embeds: [embed] });
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
            cnt.get("events.message.cooldown", {
              time: timeLeft.toFixed(1),
              command: command.name,
            })
          )
          .setColor(this.client.color.red);
        return await cnt.sendMessage({ embeds: [embed] });
      }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
      await command.run(this.client, cnt, args);
    } catch (error) {
      this.client.logger.error(error);
      const embed = this.client
        .embed()
        .setDescription(
          cnt.get("events.message.error", {
            error: error.message || "Unknown error",
          })
        )
        .setColor(this.client.color.red);
      await cnt.sendMessage({ embeds: [embed] });
    }
  }
}
