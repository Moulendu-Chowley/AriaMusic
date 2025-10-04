import contentData from "../configure/content.json" with { type: "json" };

/**
 * Smart Content Management System
 * Allows for shorter paths based on command context
 */
class ContentManager {
  constructor() {
    this.data = contentData;
    this.currentCommand = null;
  }

  /**
   * Set the current command context (auto-detected from file path)
   * @param {string} commandName - The command name (e.g., "help", "play", "ping")
   */
  setCommand(commandName) {
    this.currentCommand = commandName?.toLowerCase();
  }

  /**
   * Get content with smart path resolution
   * @param {string} path - The path to the content (e.g., "description", "help.title", "common.no_music_playing")
   * @param {Object} params - Parameters for string interpolation
   * @returns {string} The content text with parameters replaced
   */
  get(path, params = {}) {
    let value = this.resolveContent(path);

    if (typeof value !== "string") {
      console.warn(`Content path "${path}" not found or is not a string`);
      return path; // Return the path itself as fallback
    }

    return this.interpolate(value, params);
  }

  /**
   * Resolve content path with smart shortcuts
   * @param {string} path - The content path
   * @returns {any} The resolved content
   */
  resolveContent(path) {
    // Split path into parts
    const parts = path.split(".");

    // Try direct path first (e.g., "common.no_music_playing")
    let value = this.getNestedValue(this.data, parts);
    if (value !== undefined) {
      return value;
    }

    // If we have a current command context, try command-specific shortcuts
    if (this.currentCommand && !path.startsWith("commands.")) {
      // Try: commands.{currentCommand}.{path}
      const commandPath = ["commands", this.currentCommand, ...parts];
      value = this.getNestedValue(this.data, commandPath);
      if (value !== undefined) {
        return value;
      }
    }

    // Try legacy cmd.* format for backward compatibility
    if (parts[0] === "cmd") {
      const legacyPath = ["commands", ...parts.slice(1)];
      value = this.getNestedValue(this.data, legacyPath);
      if (value !== undefined) {
        return value;
      }
    }

    return undefined;
  }

  /**
   * Get nested value from object using path array
   * @param {Object} obj - The object to traverse
   * @param {string[]} path - Array of keys
   * @returns {any} The nested value or undefined
   */
  getNestedValue(obj, path) {
    return path.reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Replace {param} placeholders with actual values
   * @param {string} text - Text with placeholders like "Hello {name}"
   * @param {Object} params - Object with replacement values
   * @returns {string} Text with placeholders replaced
   */
  interpolate(text, params) {
    if (!params || typeof params !== "object") {
      return text;
    }

    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }
}

// Create singleton instance
const contentManager = new ContentManager();

/**
 * Auto-detect command name from file path for smart shortcuts
 * @param {string} filePath - The file path (usually import.meta.url)
 * @returns {ContentManager} Content manager with command context set
 */
export function createContentForCommand(filePath) {
  if (filePath) {
    // Extract command name from file path
    // e.g., "/commands/music/Help.js" -> "help"
    const match = filePath.match(/\/commands\/[^/]+\/([^/.]+)\.js$/i);
    if (match) {
      const commandName = match[1].toLowerCase();
      contentManager.setCommand(commandName);
    }
  }
  return contentManager;
}

// Export the class for creating new instances
export { ContentManager };

// Export the singleton for global use
export const content = contentManager;

// Export a function that creates command-specific content access
export default contentManager;