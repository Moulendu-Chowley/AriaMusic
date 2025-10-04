import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class ClearQueue extends Command {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: "clearqueue",
      description: {
        content: "commands.clearqueue.description",
        examples: ["clearqueue"],
        usage: "clearqueue",
      },
      category: "music",
      aliases: ["cq"],
      cooldown: 3,
      args: false,
      vote: false,
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
    const embed = this.client.embed();

    if (!player) {
      return await cnt.sendMessage({
        embeds: [
          embed
            .setColor(this.client.color.red)
            .setDescription(cnt.get("player.errors.no_player")),
        ],
      });
    }

    if (player.queue.tracks.length === 0) {
      return await cnt.sendMessage({
        embeds: [
          embed
            .setColor(this.client.color.red)
            .setDescription(cnt.get("player.errors.no_song")),
        ],
      });
    }

    player.queue.tracks.splice(0, player.queue.tracks.length);

    return await cnt.sendMessage({
      embeds: [
        embed
          .setColor(this.client.color.main)
          .setDescription(cnt.get("commands.clearqueue.messages.cleared")),
      ],
    });
  }
}
