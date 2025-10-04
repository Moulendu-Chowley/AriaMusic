import { Command } from "../../structures/index.js";

/**
 * @extends {Command}
 */
export default class Prefix extends Command {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: "prefix",
      description: {
        content: "commands.prefix.description",
        examples: ["prefix set !", "prefix reset"],
        usage: "prefix",
      },
      category: "general",
      aliases: ["pf"],
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
          description: "commands.prefix.options.set",
          type: 1,
          options: [
            {
              name: "prefix",
              description: "commands.prefix.options.prefix",
              type: 3,
              required: true,
            },
          ],
        },
        {
          name: "reset",
          description: "commands.prefix.options.reset",
          type: 1,
        },
      ],
    });
  }

  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   * @param {import('../../structures/Content.js').Content} cnt
   * @param {string[]} args
   */
  async run(client, cnt, args) {
    const embed = client.embed().setColor(this.client.color.main);
    const guildId = cnt.guild.id;
    const guildData = await client.db.get(guildId);

    const isInteraction = cnt.isInteraction;
    let subCommand;
    let prefix;

    if (isInteraction) {
      subCommand = cnt.options.getSubCommand();
      prefix = cnt.options.get("prefix")?.value?.toString();
    } else {
      subCommand = args[0] || "";
      prefix = args[1] || "";
    }

    switch (subCommand) {
      case "set": {
        if (!prefix) {
          const currentPrefix = guildData
            ? guildData.prefix
            : client.env.PREFIX;
          embed.setDescription(
            cnt.get("commands.prefix.messages.current_prefix", {
              prefix: currentPrefix,
            })
          );
          return await cnt.sendMessage({ embeds: [embed] });
        }

        if (prefix.length > 3) {
          embed.setDescription(
            cnt.get("commands.prefix.errors.prefix_too_long")
          );
          return await cnt.sendMessage({ embeds: [embed] });
        }

        await client.db.setPrefix(guildId, prefix);
        embed.setDescription(
          cnt.get("commands.prefix.messages.prefix_set", { prefix })
        );
        return await cnt.sendMessage({ embeds: [embed] });
      }
      case "reset": {
        const defaultPrefix = client.env.PREFIX;
        await client.db.setPrefix(guildId, defaultPrefix);
        embed.setDescription(
          cnt.get("commands.prefix.messages.prefix_reset", {
            prefix: defaultPrefix,
          })
        );
        return await cnt.sendMessage({ embeds: [embed] });
      }
      default: {
        const currentPrefix = guildData ? guildData.prefix : client.env.PREFIX;
        embed.setDescription(
          cnt.get("commands.prefix.messages.current_prefix", {
            prefix: currentPrefix,
          })
        );
        return await cnt.sendMessage({ embeds: [embed] });
      }
    }
  }
}
