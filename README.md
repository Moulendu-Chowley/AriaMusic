<center><img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=AriaMusic&fontSize=80&fontAlignY=35&animation=twinkling&fontColor=gradient" /></center>

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/Moulendu-Chowley/AriaMusic">
    <img src="https://cdn.discordapp.com/attachments/933725783422271538/949321683938971678/CC_20220304_203437.png?ex=68b50d76&is=68b3bbf6&hm=d04befda5022db700fed0d54f9af324836e875283af3150eb74fa48cda270563&" alt="AriaMusic" width="200" height="200">
  </a>

  <h1 align="center">AriaMusic</h1>
  <p align="center">
    AriaMusic is a feature-rich Discord music bot developed by Moulendu Chowley. It's designed to provide a seamless and high-quality music experience on Discord, leveraging a powerful tech stack to deliver a wide range of features.
    <br />
    <br />
    <a href="https://discord.com/oauth2/authorize?client_id=851377969607344128&permissions=66448720&scope=bot%20applications.commands">Invite AriaMusic</a>
    ·
    <a href="https://github.com/Moulendu-Chowley/AriaMusic/issues">Report Bug & Request Feature</a>
  </p>
</p>

## About The Project

AriaMusic is a sophisticated Discord music bot built to bring a high-fidelity music experience to your server. It is built with a modern tech stack and a focus on scalability and extensibility.

## Core Technologies

*   **Node.js:** The runtime environment for the bot, allowing for fast and efficient execution of JavaScript code.
*   **Discord.js:** A powerful Node.js module that allows for easy interaction with the Discord API, enabling the bot to send and receive messages, manage channels, and more.
*   **Lavalink:** A standalone audio sending node that handles the music streaming for the bot. By offloading the audio processing to Lavalink, the bot can provide high-quality, lag-free music playback without impacting its own performance.
*   **Prisma:** A next-generation ORM that simplifies database interactions. Prisma is used to manage the bot's data, including server settings, user playlists, and more. It supports various databases, including SQLite, PostgreSQL, and MongoDB.

## How It Works

AriaMusic's architecture is designed for efficiency and scalability:

*   **Command Handling:** The bot features a hybrid command system that supports both traditional prefix commands and modern slash commands. Commands are organized into categories, making the codebase clean and easy to navigate.
*   **Event Handling:** The bot uses an event-driven architecture to respond to actions in a Discord server, such as new messages, user joins, and voice state updates. Events are also neatly organized by category.
*   **Sharding:** To ensure smooth operation on a large number of servers, AriaMusic is designed with a sharded architecture. This allows the bot to be split into multiple processes, each handling a subset of the total guilds.
*   **Internationalization (i18n):** The bot supports multiple languages, with language files stored in the `locales` directory. This allows server owners to set their preferred language for the bot's responses.

## Music Playback and Search

The core of AriaMusic's functionality lies in its ability to search for and play music from various sources. Here's a breakdown of how it works:

1.  **User Command:** A user initiates a music request by using the `!play` command followed by a song name or URL.

2.  **Command Processing:** The bot's `Play.js` command file receives the request. It then communicates with the **Lavalink** server to search for the requested track.

3.  **Lavalink Search:** Lavalink takes the search query and searches across its supported platforms (SoundCloud, Twitch, Bandcamp, etc.). If a URL is provided, Lavalink will attempt to resolve it directly.

4.  **Extending Search with Plugins:** AriaMusic's capabilities can be extended with Lavalink plugins. For example, by adding the `LavaSrc` plugin, the bot can also search for tracks on Spotify, Deezer, and Apple Music. These plugins are added to the Lavalink server, and the bot can then use them to search for tracks on these additional platforms.

5.  **Track Queuing:** Once Lavalink returns the search results, the bot presents them to the user. The user can then select a track to add to the queue. The queue is managed by the bot and stored in memory.

6.  **Voice Connection:** If the bot is not already in a voice channel, it joins the user's voice channel.

7.  **Audio Streaming:** The bot instructs Lavalink to start streaming the audio of the selected track to the voice channel. Lavalink handles the entire audio stream, from fetching the audio from the source to sending it to Discord.

8.  **Track Events:** As the track plays, Lavalink emits events such as `TrackStart`, `TrackEnd`, and `QueueEnd`. The bot listens for these events to manage the queue, play the next song, or leave the voice channel when the queue is empty.

This process ensures that the bot itself is not burdened with the heavy task of audio processing, resulting in a smooth and reliable music experience.

## Key Features

*   **High-Quality Music:** By leveraging Lavalink, AriaMusic delivers a top-tier music listening experience.
*   **Wide Range of Sources:** The bot supports a variety of music sources, including SoundCloud, Twitch, and Bandcamp, with the ability to add even more through plugins.
*   **Extensive Music Commands:** AriaMusic offers a comprehensive set of music commands, including:
    *   `play`: Play a song or add it to the queue.
    *   `skip`: Skip the current song.
    *   `queue`: View the current song queue.
    *   `loop`: Loop the current song or the entire queue.
    *   And many more...
*   **Playlist Management:** Users can create, save, and load their own custom playlists.
*   **Audio Filters:** A variety of audio filters are available to customize the music playback, such as `bassboost`, `nightcore`, and `karaoke`.
*   **Configurability:** Server owners can customize various aspects of the bot, including the prefix, language, and DJ roles.

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Support Server][support-shield]][support-server]
[![MIT License][license-shield]][license-url]

## 🔐 License

Distributed under the GPL-3.0 license. See [![LICENSE](https://img.shields.io/github/license/Moulendu-Chowley/AriaMusic?style=social)](https://github.com/Moulendu-Chowley/AriaMusic/blob/main/LICENSE) for more information.

[contributors-shield]: https://img.shields.io/github/contributors/Moulendu-Chowley/AriaMusic.svg?style=for-the-badge
[contributors-url]: https://github.com/Moulendu-Chowley/AriaMusic/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Moulendu-Chowley/AriaMusic.svg?style=for-the-badge
[forks-url]: https://github.com/Moulendu-Chowley/AriaMusic/network/members
[stars-shield]: https://img.shields.io/github/stars/Moulendu-Chowley/AriaMusic.svg?style=for-the-badge
[stars-url]: https://github.com/Moulendu-Chowley/AriaMusic/stargazers
[issues-shield]: https://img.shields.io/github/issues/Moulendu-Chowley/AriaMusic.svg?style=for-the-badge
[issues-url]: https://github.com/Moulendu-Chowley/AriaMusic/issues
[license-shield]: https://img.shields.io/github/license/Moulendu-Chowley/AriaMusic.svg?style=for-the-badge
[license-url]: https://github.com/Moulendu-Chowley/AriaMusic/blob/master/LICENSE
[support-server]: https://discord.gg/3puJWDNzzA
[support-shield]: https://img.shields.io/discord/831043641929760788.svg?style=for-the-badge&logo=discord&colorB=7289DA
