import { Command } from "../../structures/index.js";

/**
 * @extends {Command}
 */
export default class NoPrefix extends Command {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: "noprefix",
      description: {
        content: "commands.noprefix.description",
        examples: [
          "noprefix add @user",
          "noprefix remove @user",
          "noprefix list",
        ],
        usage: "noprefix <add|remove|list> [user]",
      },
      category: "dev",
      aliases: ["nop"],
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
        dev: true,
        client: ["SendMessages", "ReadMessageHistory", "ViewChannel"],
        user: [],
      },
      slashCommand: false,
      options: [],
    });
  }

  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   * @param {import('../../structures/Content.js').Content} cnt
   * @param {string[]} args
   */
  async run(client, cnt, args) {
    const embed = this.client.embed();
    const action = args[0]?.toLowerCase();

    if (!["add", "remove", "list"].includes(action)) {
      return await cnt.sendMessage({
        embeds: [
          embed.setColor(client.color.red).setDescription(
            cnt.get("commands.noprefix.invalid_action", {
              usage: "noprefix <add|remove|list> [user]",
            })
          ),
        ],
      });
    }

    // List all no-prefix users
    if (action === "list") {
      const noPrefixUsers = await client.db.getNoPrefixUsers();

      if (noPrefixUsers.length === 0) {
        return await cnt.sendMessage({
          embeds: [
            embed
              .setColor(client.color.main)
              .setDescription(cnt.get("commands.noprefix.list_empty")),
          ],
        });
      }

      const userList = noPrefixUsers
        .map(
          (user, index) => `${index + 1}. <@${user.userId}> (${user.userId})`
        )
        .join("\n");

      return await cnt.sendMessage({
        embeds: [
          embed
            .setColor(client.color.main)
            .setTitle(cnt.get("commands.noprefix.list_title"))
            .setDescription(userList)
            .setFooter({ text: `Total: ${noPrefixUsers.length} users` }),
        ],
      });
    }

    // Add or remove requires a user
    if (!args[1]) {
      return await cnt.sendMessage({
        embeds: [
          embed
            .setColor(client.color.red)
            .setDescription(cnt.get("commands.noprefix.no_user_provided")),
        ],
      });
    }

    // Parse user ID from mention or direct ID
    let userId = args[1];
    if (userId.startsWith("<@") && userId.endsWith(">")) {
      userId = userId.slice(2, -1);
      if (userId.startsWith("!")) {
        userId = userId.slice(1);
      }
    }

    // Validate user ID
    if (!/^\d{17,19}$/.test(userId)) {
      return await cnt.sendMessage({
        embeds: [
          embed
            .setColor(client.color.red)
            .setDescription(cnt.get("commands.noprefix.invalid_user")),
        ],
      });
    }

    try {
      // Try to fetch user to ensure they exist
      const user = await client.users.fetch(userId);

      if (action === "add") {
        // Check if user is already in no-prefix list
        const isAlreadyNoPrefix = await client.db.isNoPrefixUser(userId);

        if (isAlreadyNoPrefix) {
          return await cnt.sendMessage({
            embeds: [
              embed.setColor(client.color.yellow).setDescription(
                cnt.get("commands.noprefix.user_already_added", {
                  user: user.username,
                })
              ),
            ],
          });
        }

        await client.db.addNoPrefixUser(userId, cnt.author.id);

        return await cnt.sendMessage({
          embeds: [
            embed.setColor(client.color.green).setDescription(
              cnt.get("commands.noprefix.user_added", {
                user: user.username,
                userId: userId,
              })
            ),
          ],
        });
      }

      if (action === "remove") {
        // Check if user is in no-prefix list
        const isNoPrefix = await client.db.isNoPrefixUser(userId);

        if (!isNoPrefix) {
          return await cnt.sendMessage({
            embeds: [
              embed.setColor(client.color.yellow).setDescription(
                cnt.get("commands.noprefix.user_not_found", {
                  user: user.username,
                })
              ),
            ],
          });
        }

        await client.db.removeNoPrefixUser(userId);

        return await cnt.sendMessage({
          embeds: [
            embed.setColor(client.color.green).setDescription(
              cnt.get("commands.noprefix.user_removed", {
                user: user.username,
                userId: userId,
              })
            ),
          ],
        });
      }
    } catch (error) {
      return await cnt.sendMessage({
        embeds: [
          embed.setColor(client.color.red).setDescription(
            cnt.get("commands.noprefix.user_fetch_error", {
              userId: userId,
            })
          ),
        ],
      });
    }
  }
}
