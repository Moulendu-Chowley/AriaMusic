import { Command } from "../../structures/index.js";

/**
 * @extends {Command}
 */
export default class Dj extends Command {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: "dj",
      description: {
        content: "commands.dj.description",
        examples: ["dj add @role", "dj remove @role", "dj clear", "dj toggle"],
        usage: "dj",
      },
      category: "general",
      aliases: ["dj"],
      cooldown: 3,
      args: true,
      vote: true,
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
          name: "add",
          description: "commands.dj.options.add",
          type: 1,
          options: [
            {
              name: "role",
              description: "commands.dj.options.role",
              type: 8,
              required: true,
            },
          ],
        },
        {
          name: "remove",
          description: "commands.dj.options.remove",
          type: 1,
          options: [
            {
              name: "role",
              description: "commands.dj.options.role",
              type: 8,
              required: true,
            },
          ],
        },
        {
          name: "clear",
          description: "commands.dj.options.clear",
          type: 1,
        },
        {
          name: "toggle",
          description: "commands.dj.options.toggle",
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
    const embed = this.client.embed().setColor(this.client.color.main);
    const dj = await client.db.getDj(cnt.guild.id);

    let subCommand;
    let role;

    if (cnt.isInteraction) {
      subCommand = cnt.options.getSubCommand();
      if (subCommand === "add" || subCommand === "remove") {
        role = cnt.options.getRole("role");
      }
    } else {
      subCommand = args[0];
      role =
        cnt.message?.mentions.roles.first() ||
        cnt.guild?.roles.cache.get(args[1]);
    }

    switch (subCommand) {
      case "add": {
        if (!role) {
          return cnt.sendMessage({
            embeds: [
              embed.setDescription(cnt.get("commands.dj.errors.provide_role")),
            ],
          });
        }
        if (
          await client.db
            .getRoles(cnt.guild.id)
            .then((r) => r.some((re) => re.roleId === role.id))
        ) {
          return cnt.sendMessage({
            embeds: [
              embed.setDescription(
                cnt.get("commands.dj.messages.role_exists", {
                  roleId: role.id,
                })
              ),
            ],
          });
        }
        await client.db.addRole(cnt.guild.id, role.id);
        await client.db.setDj(cnt.guild.id, true);
        return cnt.sendMessage({
          embeds: [
            embed.setDescription(
              cnt.get("commands.dj.messages.role_added", {
                roleId: role.id,
              })
            ),
          ],
        });
      }
      case "remove": {
        if (!role) {
          return cnt.sendMessage({
            embeds: [
              embed.setDescription(cnt.get("commands.dj.errors.provide_role")),
            ],
          });
        }
        if (
          !(await client.db
            .getRoles(cnt.guild.id)
            .then((r) => r.some((re) => re.roleId === role.id)))
        ) {
          return cnt.sendMessage({
            embeds: [
              embed.setDescription(
                cnt.get("commands.dj.messages.role_not_found", {
                  roleId: role.id,
                })
              ),
            ],
          });
        }
        await client.db.removeRole(cnt.guild.id, role.id);
        return cnt.sendMessage({
          embeds: [
            embed.setDescription(
              cnt.get("commands.dj.messages.role_removed", {
                roleId: role.id,
              })
            ),
          ],
        });
      }
      case "clear": {
        if (!dj) {
          return cnt.sendMessage({
            embeds: [
              embed.setDescription(cnt.get("commands.dj.errors.no_roles")),
            ],
          });
        }
        await client.db.clearRoles(cnt.guild.id);
        return cnt.sendMessage({
          embeds: [
            embed.setDescription(
              cnt.get("commands.dj.messages.all_roles_cleared")
            ),
          ],
        });
      }
      case "toggle": {
        if (!dj) {
          return cnt.sendMessage({
            embeds: [
              embed.setDescription(cnt.get("commands.dj.errors.no_roles")),
            ],
          });
        }
        await client.db.setDj(cnt.guild.id, !dj.mode);
        return cnt.sendMessage({
          embeds: [
            embed.setDescription(
              cnt.get("commands.dj.messages.toggle", {
                status: dj.mode ? "disabled" : "enabled",
              })
            ),
          ],
        });
      }
      default:
        return cnt.sendMessage({
          embeds: [
            embed
              .setDescription(cnt.get("commands.dj.errors.invalid_subcommand"))
              .addFields({
                name: cnt.get("commands.dj.subcommands"),
                value: "`add`, `remove`, `clear`, `toggle`",
              }),
          ],
        });
    }
  }
}
