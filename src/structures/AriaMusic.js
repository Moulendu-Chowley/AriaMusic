import { Api } from "@top-gg/sdk";
import {
  ApplicationCommandType,
  Client,
  Collection,
  EmbedBuilder,
  Events,
  PermissionsBitField,
  REST,
  Routes,
} from "discord.js";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import path from "path";
import config from "../configure/config.js";
import Database from "../database/server.js";
import { env } from "../env.js";
import loadPlugins from "../plugin/index.js";
import { content } from "../utils/ContentManager.js";
import Utils from "../utils/Utils.js";

import LavalinkClient from "./LavalinkClient.js";
import Logger from "./Logger.js";

/**
 * Represents the main client.
 */
export default class AriaMusic extends Client {
  commands = new Collection();
  aliases = new Collection();
  db = new Database();
  cooldown = new Collection();
  config = config;
  logger = new Logger();
  emoji = config.emoji;
  color = config.color;
  body = [];
  topGG;
  utils = Utils;
  env = env;
  manager;
  rest = new REST({ version: "10" }).setToken(env.TOKEN ?? "");

  /**
   * Creates an embed builder.
   * @returns {EmbedBuilder}
   */
  embed() {
    return new EmbedBuilder();
  }

  /**
   * Starts the client.
   * @param {string} token The bot token.
   */
  async start(token) {
    if (env.TOPGG) {
      this.topGG = new Api(env.TOPGG);
    } else {
      this.logger.warn("Top.gg token not found!");
    }
    this.manager = new LavalinkClient(this);
    await this.loadCommands();
    this.logger.info("Successfully loaded commands!");
    await this.loadEvents();
    this.logger.info("Successfully loaded events!");
    loadPlugins(this);
    await this.login(token);

    this.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isButton() && interaction.guildId) {
        const setup = await this.db.getSetup(interaction.guildId);
        if (
          setup &&
          interaction.channelId === setup.textId &&
          interaction.message.id === setup.messageId
        ) {
          this.emit("setupButtons", interaction);
        }
      }
    });
  }

  /**
   * Loads all commands.
   */
  async loadCommands() {
    const commandsPath = fs.readdirSync(
      path.join(process.cwd(), "src", "commands")
    );
    for (const dir of commandsPath) {
      const commandFiles = fs
        .readdirSync(path.join(process.cwd(), "src", "commands", dir))
        .filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        const cmdModule = await import(
          pathToFileURL(path.join(process.cwd(), "src", "commands", dir, file))
        );
        const command = new cmdModule.default(this, file);
        command.category = dir;
        this.commands.set(command.name, command);
        command.aliases.forEach((alias) => {
          this.aliases.set(alias, command.name);
        });

        if (command.slashCommand) {
          let description = `Execute ${command.name} command`;

          // Resolve description using ContentManager
          if (command.description?.content) {
            const resolvedDescription = content.get(
              command.description.content
            );
            if (resolvedDescription) {
              description = resolvedDescription;
            }
          }

          // Ensure description meets Discord requirements (1-100 characters)
          if (description.length > 100) {
            description = description.substring(0, 97) + "...";
          }

          const data = {
            name: command.name,
            description: description,
            type: ApplicationCommandType.ChatInput,
            options: command.options || [],
            default_member_permissions:
              Array.isArray(command.permissions.user) &&
              command.permissions.user.length > 0
                ? PermissionsBitField.resolve(
                    command.permissions.user
                  ).toString()
                : null,
          };

          // Options are already properly configured in command definitions
          this.body.push(data);
        }
      }
    }
  }

  /**
   * Deploys all commands.
   * @param {string} [guildId] The ID of the guild to deploy the commands to.
   */
  async deployCommands(guildId) {
    const route = guildId
      ? Routes.applicationGuildCommands(this.user?.id ?? "", guildId)
      : Routes.applicationCommands(this.user?.id ?? "");
    try {
      await this.rest.put(route, { body: this.body });
      this.logger.info("Successfully deployed slash commands!");
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * Clears all commands.
   * @param {string} [guildId] The ID of the guild to clear commands from.
   */
  async clearCommands(guildId) {
    const route = guildId
      ? Routes.applicationGuildCommands(this.user?.id ?? "", guildId)
      : Routes.applicationCommands(this.user?.id ?? "");
    try {
      await this.rest.put(route, { body: [] });
      this.logger.info(
        guildId
          ? "Successfully cleared guild slash commands!"
          : "Successfully cleared global slash commands!"
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * Loads all events.
   */
  async loadEvents() {
    const eventsPath = fs.readdirSync(
      path.join(process.cwd(), "src", "events")
    );
    for (const dir of eventsPath) {
      const eventFiles = fs
        .readdirSync(path.join(process.cwd(), "src", "events", dir))
        .filter((file) => file.endsWith(".js"));
      for (const file of eventFiles) {
        const eventModule = await import(
          pathToFileURL(path.join(process.cwd(), "src", "events", dir, file))
        );
        const event = new eventModule.default(this);
        if (dir === "player") {
          this.manager.on(event.name, (...args) => event.run(...args));
        } else if (dir === "node") {
          this.manager.nodeManager.on(event.name, (...args) =>
            event.run(...args)
          );
        } else {
          this.on(event.name, (...args) => event.run(...args));
        }
      }
    }
  }

  /**
   * Perform cleanup before shutdown/restart
   */
  async cleanup() {
    this.logger.info("Starting cleanup process...");

    // Clear activity rotation interval
    if (this.activityRotationInterval) {
      clearInterval(this.activityRotationInterval);
      this.activityRotationInterval = null;
      this.logger.info("Cleared activity rotation interval");
    }

    // Clear all music players
    if (this.manager && this.manager.players) {
      for (const player of this.manager.players.values()) {
        try {
          await player.destroy();
        } catch (error) {
          this.logger.error("Error destroying player:", error);
        }
      }
      this.logger.info("Destroyed all music players");
    }

    // Clear all timers
    const timers = this._timeouts || [];
    timers.forEach((timer) => {
      clearTimeout(timer);
    });

    this.logger.info("Cleanup process completed");
  }
}
