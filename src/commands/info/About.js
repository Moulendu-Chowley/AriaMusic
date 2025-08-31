import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Command } from "../../structures/index.js";

/**
 * @extends {Command}
 */
export default class About extends Command {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: "about",
      description: {
        content: "cmd.about.description",
        examples: ["about"],
        usage: "about",
      },
      category: "info",
      aliases: ["ab"],
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
      options: [],
    });
  }

  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   * @param {import('../../structures/Context.js').Context} ctx
   */
  async run(client, ctx) {
    const inviteButton = new ButtonBuilder()
      .setLabel(ctx.locale("buttons.invite"))
      .setStyle(ButtonStyle.Link)
      .setURL(
        `https://discord.com/api/oauth2/authorize?client_id=${client.env.CLIENT_ID}&permissions=274881431873&scope=bot%20applications.commands`
      );

    const supportButton = new ButtonBuilder()
      .setLabel(ctx.locale("buttons.support"))
      .setStyle(ButtonStyle.Link)
      .setURL("https://discord.gg/3puJWDNzzA");

    const row = new ActionRowBuilder().addComponents(
      inviteButton,
      supportButton
    );

    const embed = this.client
      .embed()
      .setAuthor({
        name: "Aria Music",
        iconURL:
          "https://media.discordapp.net/attachments/933725783422271538/949321683938971678/CC_20220304_203437.png?ex=68b50d76&is=68b3bbf6&hm=d04befda5022db700fed0d54f9af324836e875283af3150eb74fa48cda270563&=&format=webp&quality=lossless",
      })
      .setThumbnail(
        "https://media.discordapp.net/attachments/933725783422271538/949321683938971678/CC_20220304_203437.png?ex=68b50d76&is=68b3bbf6&hm=d04befda5022db700fed0d54f9af324836e875283af3150eb74fa48cda270563&=&format=webp&quality=lossless"
      )
      .setColor(this.client.color.main)
      .addFields(
        {
          name: ctx.locale("cmd.about.fields.creator"),
          value: "Moulendu Chowley",
          inline: true,
        },
        {
          name: ctx.locale("cmd.about.fields.repository"),
          value: "[Here](https://github.com/Moulendu-Chowley/AriaMusic)",
          inline: true,
        },
        {
          name: ctx.locale("cmd.about.fields.support"),
          value: "[Here](https://discord.gg/3puJWDNzzA)",
          inline: true,
        },
        {
          name: "\u200b",
          value: ctx.locale("cmd.about.fields.description"),
          inline: true,
        }
      );

    await ctx.sendMessage({
      content: "",
      embeds: [embed],
      components: [row],
    });
  }
}
