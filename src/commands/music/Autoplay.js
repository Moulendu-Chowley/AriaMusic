import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Autoplay extends Command {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: "autoplay",
      description: {
        content: "commands.autoplay.description",
        examples: ["autoplay"],
        usage: "autoplay",
      },
      category: "music",
      aliases: ["ap"],
      cooldown: 3,
      args: false,
      vote: true,
      player: {
        voice: true,
        dj: true,
        active: true,
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
   * @param {import('../../structures/Content.js').Content} cnt
   */
  async run(client, cnt) {
    const player = client.manager.getPlayer(cnt.guild.id);
    if (!player) {
      return await cnt.sendMessage({
        embeds: [
          {
            description: cnt.get("player.errors.no_player"),
            color: this.client.color.red,
          },
        ],
      });
    }

    const embed = this.client.embed();
    const autoplay = player.get("autoplay");
    player.set("autoplay", !autoplay);

    if (autoplay) {
      embed
        .setDescription(cnt.get("commands.autoplay.messages.disabled"))
        .setColor(this.client.color.main);
    } else {
      embed
        .setDescription(cnt.get("commands.autoplay.messages.enabled"))
        .setColor(this.client.color.main);
    }

    await cnt.sendMessage({ embeds: [embed] });
  }
}
