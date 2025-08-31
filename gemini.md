# Project: AriaMusic

## Project Overview

AriaMusic is a Discord music bot built with Node.js, Discord.js, and Lavalink. It features a robust command and event handling system, database integration with Prisma, and a sharded architecture for scalability. The bot supports a wide variety of music sources, including SoundCloud, Twitch, Bandcamp, and more, with additional sources available through plugins. It also includes features like multi-language support, a customizable prefix, and a hybrid command system that supports both slash and traditional commands.

## Building and Running

### Prerequisites

*   Node.js (LTS or higher)
*   Lavalink (v4 or higher)
*   A Discord Bot Token

### Installation and Running

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure the environment:**
    *   Copy `.env.example` to `.env` and fill in the required values, including your Discord bot token and other configuration options.
    *   If you are not using sqlite, copy the appropriate `example.<database>.schema.prisma` file to `schema.prisma` in the `prisma` directory and configure the `DATABASE_URL` in your `.env` file.

3.  **Push the database schema:**
    ```bash
    npm run db:push
    ```

4.  **Build the project:**
    ```bash
    npm run build
    ```

5.  **Start the bot:**
    ```bash
    npm start
    ```

### Other Commands

*   **Run database migrations:**
    ```bash
    npm run db:migrate
    ```
*   **Start the bot with panel:**
    ```bash
    npm run start:panel
    ```

## Development Conventions

*   **Code Style:** The project uses modern JavaScript (ESM) and follows a consistent coding style.
*   **Command Handling:** Commands are organized into categories within the `src/commands` directory. Each command is a class that extends the base `Command` class.
*   **Event Handling:** Events are located in the `src/events` directory and are also organized by category. Each event is a class that extends the base `Event` class.
*   **Database:** The project uses Prisma for database access. The database schema is defined in `prisma/schema.prisma`.
*   **Internationalization (i18n):** The bot supports multiple languages using the `i18n` library. Language files are located in the `locales` directory.
*   **Sharding:** The bot is designed to be sharded for scalability. The sharding logic is handled in `src/shard.js`.
