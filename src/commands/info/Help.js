import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Command } from "../../structures/index.js";

/**
 * @extends {Command}
 */
export default class Help extends Command {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: "help",
      description: {
        content: "commands.help.description",
        examples: ["help"],
        usage: "help",
      },
      category: "info",
      aliases: ["h"],
      cooldown: 3,
      args: false,
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
        user: [],
      },
      slashCommand: true,
      options: [
        {
          name: "command",
          description: "commands.help.options.command",
          type: 3,
          required: false,
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
    const embed = this.client.embed();
    const guild = await client.db.get(cnt.guild.id);

    // Check if user is an owner
    const isOwner = client.env.OWNER_IDS?.includes(cnt.author.id) || false;

    // Filter commands based on whether user is owner
    const commands = this.client.commands.filter((cmd) => {
      if (commands.category === "dev") {
        return isOwner; // Only show dev commands to owners
      }
      return true; // Show all other commands
    });

    // Define category order, include dev only for owners
    const categoryOrder = ["info", "config", "music", "filters", "playlist"];

    if (isOwner) {
      categoryOrder.push("dev");
    }

    const categories = categoryOrder.filter((cat) =>
      commands.some((cmd) => commands.category === cat)
    );
    if (args[0]) {
      const command = this.client.commands.get(args[0].toLowerCase());
      if (!command) {
        return await cnt.sendMessage({
          embeds: [
            embed.setColor(this.client.color.red).setDescription(
              cnt.get("commands.help.not_found", {
                cmdName: args[0],
              })
            ),
          ],
        });
      }

      const helpEmbed = embed
        .setColor(client.color.main)
        .setTitle(`${cnt.get("commands.help.title")} - ${command.name}`)
        .setDescription(
          cnt.get("commands.help.help_cmd", {
            description: cnt.get(command.description.content),
            usage: `${guild?.prefix}${command.description.usage}`,
            examples: command.description.examples
              .map((example) => `${guild.prefix}${example}`)
              .join(", "),
            aliases: command.aliases.map((alias) => `\`${alias}\``).join(", "),
            category: command.category,
            cooldown: command.cooldown,
            premUser:
              command.permissions.user.length > 0
                ? command.permissions.user
                    .map((perm) => `\`${perm}\``)
                    .join(", ")
                : "None",
            premBot: command.permissions.client
              .map((perm) => `\`${perm}\``)
              .join(", "),
            dev: command.permissions.dev ? "Yes" : "No",
            slash: command.slashCommand ? "Yes" : "No",
            args: command.args ? "Yes" : "No",
            player: command.player.active ? "Yes" : "No",
            dj: command.player.dj ? "Yes" : "No",
            djPerm: command.player.djPerm ? command.player.djPerm : "None",
            voice: command.player.voice ? "Yes" : "No",
          })
        );
      return await cnt.sendMessage({ embeds: [helpEmbed] });
    }

    const fields = categories.map((category) => ({
      name: `${
        client.config.emoji.category[category] ||
        client.config.emoji.category.fallback
      } ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      value: commands
        .filter((cmd) => commands.category === category)
        .map((cmd) => `\`${commands.name}\``)
        .join(", "),
      inline: false,
    }));

    const helpEmbed = embed
      .setColor(client.color.main)
      .setTitle(cnt.get("commands.help.title"))
      .setDescription(
        cnt.get("commands.help.content", {
          bot: client.user?.username,
          prefix: guild.prefix,
        })
      )
      .setFooter({
        text: cnt.get("commands.help.footer", {
          bot: client.user?.username,
          prefix: guild.prefix,
        }),
        iconURL: client.user?.displayAvatarURL({ dynamic: true }),
      })
      .addFields(...fields);

    const inviteButton = new ButtonBuilder()
      .setLabel("Invite Bot")
      .setStyle(ButtonStyle.Link)
      .setURL(
        `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=66448720&scope=bot%20applications.commands`
      )
      .setEmoji(client.config.emoji.buttons.link);

    const websiteButton = new ButtonBuilder()
      .setLabel("Website")
      .setStyle(ButtonStyle.Link)
      .setURL(client.config.links.website)
      .setEmoji(client.config.emoji.buttons.website);

    const actionRow = new ActionRowBuilder().addComponents(
      inviteButton,
      websiteButton
    );

    return await cnt.sendMessage({
      embeds: [helpEmbed],
      components: [actionRow],
    });
  }
}
