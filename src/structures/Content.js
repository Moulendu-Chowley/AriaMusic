import { ChatInputCommandInteraction, Message } from "discord.js";
import { ContentManager } from "../utils/ContentManager.js";

/**
 * Checks if the content is an InteractionReplyOptions object.
 * @param {any} content The content to check.
 * @returns {boolean}
 */
function isInteractionReplyOptions(content) {
  return content instanceof Object;
}

/**
 * Checks if the content is a MessagePayload object.
 * @param {any} content The content to check.
 * @returns {boolean}
 */
function isMessagePayload(content) {
  return content instanceof Object;
}

/**
 * Represents a command content context.
 */
export default class Content {
  cnt;
  interaction;
  message;
  id;
  channelId;
  client;
  author;
  channel;
  guild;
  createdAt;
  createdTimestamp;
  member;
  args;
  msg;
  commandName;

  /**
   * @param {ChatInputCommandInteraction | Message} cnt The context of the command.
   * @param {any[]} args The command arguments.
   */
  constructor(cnt, args) {
    this.cnt = cnt;
    this.interaction = cnt instanceof ChatInputCommandInteraction ? cnt : null;
    this.message = cnt instanceof Message ? cnt : null;
    this.channel = cnt.channel;
    this.id = cnt.id;
    this.channelId = cnt.channelId;
    this.client = cnt.client;
    this.author = cnt instanceof Message ? cnt.author : cnt.user;
    this.guild = cnt.guild;
    this.createdAt = cnt.createdAt;
    this.createdTimestamp = cnt.createdTimestamp;
    this.member = cnt.member;
    this.args = args;
    this.setArgs(args);

    // Auto-detect command name for smart content resolution
    this.detectCommandName();

    // Add direct callable method instead of proxy
    this.get = this.getText.bind(this);
  }

  /**
   * Auto-detect command name from call stack or interaction
   */
  detectCommandName() {
    try {
      // Try to get from interaction first
      if (this.isInteraction) {
        this.commandName = this.interaction.commandName;
      } else if (this.message) {
        // For message commands, try to extract from content
        const content = this.message.content.trim();
        const args = content.split(/\s+/);
        if (args.length > 0) {
          const command = args[0].slice(1); // Remove prefix
          this.commandName = command.toLowerCase();
        }
      }

      // Set command context in content manager
      if (this.commandName) {
        content.setCommand(this.commandName);
      }
    } catch (error) {
      // Silent fallback - command detection is optional
    }
  }

  /**
   * Gets text content with smart path resolution (makes cnt callable)
   * @param {string} key The key of the content.
   * @param {Object} params The parameters for string interpolation.
   * @returns {string}
   */
  getText(key, params = {}) {
    const contentManager = new ContentManager();
    if (this.commandName) {
      contentManager.setCommand(this.commandName);
    }
    return contentManager.get(key, params);
  }

  /**
   * Checks if the context is an interaction.
   * @returns {boolean}
   */
  get isInteraction() {
    return this.cnt instanceof ChatInputCommandInteraction;
  }

  /**
   * Sets the arguments for the context.
   * @param {any[]} args The arguments to set.
   */
  setArgs(args) {
    this.args = this.isInteraction ? args.map((arg) => arg.value) : args;
  }

  /**
   * Sends a message.
   * @param {string | InteractionReplyOptions | MessagePayload} content The content to send.
   * @returns {Promise<Message>}
   */
  async sendMessage(content) {
    if (this.isInteraction) {
      if (typeof content === "string" || isInteractionReplyOptions(content)) {
        this.msg = await this.interaction?.reply(content);
        return this.msg;
      }
    } else if (typeof content === "string" || isMessagePayload(content)) {
      this.msg = await (this.message?.channel).send(content);
      return this.msg;
    }
    return this.msg;
  }

  /**
   * Edits a message.
   * @param {string | InteractionReplyOptions | MessagePayload} content The content to edit.
   * @returns {Promise<Message>}
   */
  async editMessage(content) {
    if (this.isInteraction && this.msg) {
      this.msg = await this.interaction?.editReply(content);
      return this.msg;
    }
    if (this.msg) {
      this.msg = await this.msg.edit(content);
      return this.msg;
    }
    return this.msg;
  }

  /**
   * Sends a deferred message.
   * @param {string | InteractionReplyOptions | MessagePayload} content The content to send.
   * @returns {Promise<Message>}
   */
  async sendDeferMessage(content) {
    if (this.isInteraction) {
      await this.interaction?.deferReply();
      this.msg = await this.interaction?.fetchReply();
      return this.msg;
    }
    this.msg = await (this.message?.channel).send(content);
    return this.msg;
  }

  /**
   * Sends a follow-up message.
   * @param {string | InteractionReplyOptions | MessagePayload} content The content to send.
   */
  async sendFollowUp(content) {
    if (this.isInteraction) {
      if (typeof content === "string" || isInteractionReplyOptions(content)) {
        await this.interaction?.followUp(content);
      }
    } else if (typeof content === "string" || isMessagePayload(content)) {
      this.msg = await (this.message?.channel).send(content);
    }
  }

  /**
   * Checks if the context is deferred.
   * @returns {boolean}
   */
  get deferred() {
    return this.isInteraction ? this.interaction?.deferred : !!this.msg;
  }

  options = {
    /**
     * Gets a role option.
     * @param {string} name The name of the option.
     * @param {boolean} [required=true] Whether the option is required.
     * @returns {import('discord.js').Role}
     */
    getRole: (name, required = true) => {
      return this.interaction?.options.get(name, required)?.role;
    },
    /**
     * Gets a member option.
     * @param {string} name The name of the option.
     * @param {boolean} [required=true] Whether the option is required.
     * @returns {import('discord.js').GuildMember}
     */
    getMember: (name, required = true) => {
      return this.interaction?.options.get(name, required)?.member;
    },
    /**
     * Gets an option.
     * @param {string} name The name of the option.
     * @param {boolean} [required=true] Whether the option is required.
     * @returns {any}
     */
    get: (name, required = true) => {
      return this.interaction?.options.get(name, required);
    },
    /**
     * Gets a channel option.
     * @param {string} name The name of the option.
     * @param {boolean} [required=true] Whether the option is required.
     * @returns {import('discord.js').TextChannel}
     */
    getChannel: (name, required = true) => {
      return this.interaction?.options.get(name, required)?.channel;
    },
    /**
     * Gets the sub-command.
     * @returns {string}
     */
    getSubCommand: () => {
      return this.interaction?.options.data[0].name;
    },
  };
}
