import { PrismaClient } from '@prisma/client';
import { env } from '../env.js';

/**
 * @class ServerData
 */
export default class ServerData {
    static prisma = new PrismaClient();

    /**
     * @param {string} guildId
     */
    async get(guildId) {
        return (
            (await ServerData.prisma.guild.findUnique({ where: { guildId } })) ??
            this.createGuild(guildId)
        );
    }

    /**
     * @param {string} guildId
     */
    async createGuild(guildId) {
        return await ServerData.prisma.guild.create({
            data: {
                guildId,
                prefix: env.PREFIX,
            },
        });
    }

    /**
     * @param {string} guildId
     * @param {string} prefix
     */
    async setPrefix(guildId, prefix) {
        await ServerData.prisma.guild.upsert({
            where: { guildId },
            update: { prefix },
            create: { guildId, prefix },
        });
    }

    /**
     * @param {string} guildId
     */
    async getPrefix(guildId) {
        const guild = await this.get(guildId);
        return guild?.prefix ?? env.PREFIX;
    }

    /**
     * @param {string} guildId
     * @param {string} language
     */
    async updateLanguage(guildId, language) {
        await ServerData.prisma.guild.update({
            where: { guildId },
            data: { language },
        });
    }

    /**
     * @param {string} guildId
     */
    async getLanguage(guildId) {
        const guild = await this.get(guildId);
        return guild?.language ?? env.DEFAULT_LANGUAGE;
    }

    /**
     * @param {string} guildId
     */
    async getSetup(guildId) {
        return await ServerData.prisma.setup.findUnique({ where: { guildId } });
    }

    /**
     * @param {string} guildId
     * @param {string} textId
     * @param {string} messageId
     */
    async setSetup(guildId, textId, messageId) {
        await ServerData.prisma.setup.upsert({
            where: { guildId },
            update: { textId, messageId },
            create: { guildId, textId, messageId },
        });
    }

    /**
     * @param {string} guildId
     */
    async deleteSetup(guildId) {
        await ServerData.prisma.setup.delete({ where: { guildId } });
    }

    /**
     * @param {string} guildId
     * @param {string} textId
     * @param {string} voiceId
     */
    async set_247(guildId, textId, voiceId) {
        await ServerData.prisma.stay.upsert({
            where: { guildId },
            update: { textId, voiceId },
            create: { guildId, textId, voiceId },
        });
    }

    /**
     * @param {string} guildId
     */
    async delete_247(guildId) {
        await ServerData.prisma.stay.delete({ where: { guildId } });
    }

    /**
     * @param {string | undefined} guildId
     */
    async get_247(guildId) {
        if (guildId) {
            const stay = await ServerData.prisma.stay.findUnique({ where: { guildId } });
            if (stay) return stay;
            return null;
        }
        return ServerData.prisma.stay.findMany();
    }

    /**
     * @param {string} guildId
     * @param {boolean} mode
     */
    async setDj(guildId, mode) {
        await ServerData.prisma.dj.upsert({
            where: { guildId },
            update: { mode },
            create: { guildId, mode },
        });
    }

    /**
     * @param {string} guildId
     */
    async getDj(guildId) {
        return await ServerData.prisma.dj.findUnique({ where: { guildId } });
    }

    /**
     * @param {string} guildId
     */
    async getRoles(guildId) {
        return await ServerData.prisma.role.findMany({ where: { guildId } });
    }

    /**
     * @param {string} guildId
     * @param {string} roleId
     */
    async addRole(guildId, roleId) {
        await ServerData.prisma.role.create({ data: { guildId, roleId } });
    }

    /**
     * @param {string} guildId
     * @param {string} roleId
     */
    async removeRole(guildId, roleId) {
        await ServerData.prisma.role.deleteMany({ where: { guildId, roleId } });
    }

    /**
     * @param {string} guildId
     */
    async clearRoles(guildId) {
        await ServerData.prisma.role.deleteMany({ where: { guildId } });
    }

    /**
     * @param {string} userId
     * @param {string} name
     */
    async getPlaylist(userId, name) {
        return await ServerData.prisma.playlist.findUnique({
            where: { userId_name: { userId, name } },
        });
    }

    /**
     * @param {string} userId
     */
    async getUserPlaylists(userId) {
        return await ServerData.prisma.playlist.findMany({
            where: { userId },
        });
    }

    /**
     * @param {string} userId
     * @param {string} name
     */
    async createPlaylist(userId, name) {
        await ServerData.prisma.playlist.create({ data: { userId, name } });
    }

    /**
     * @param {string} userId
     * @param {string} name
     * @param {any[]} tracks
     */
    async createPlaylistWithTracks(userId, name, tracks) {
        await ServerData.prisma.playlist.create({
            data: {
                userId,
                name,
                tracks: JSON.stringify(tracks),
            },
        });
    }

    /**
     * @param {string} userId
     * @param {string} name
     */
    async deletePlaylist(userId, name) {
        await ServerData.prisma.playlist.delete({
            where: { userId_name: { userId, name } },
        });
    }

    /**
     * @param {string} userId
     * @param {string} playlistName
     */
    async deleteSongsFromPlaylist(userId, playlistName) {
        const playlist = await this.getPlaylist(userId, playlistName);
        if (playlist) {
            await ServerData.prisma.playlist.update({
                where: {
                    userId_name: {
                        userId,
                        name: playlistName,
                    },
                },
                data: {
                    tracks: JSON.stringify([]),
                },
            });
        }
    }

    /**
     * @param {string} userId
     * @param {string} playlistName
     * @param {any[]} tracks
     */
    async addTracksToPlaylist(userId, playlistName, tracks) {
        const tracksJson = JSON.stringify(tracks);
        const playlist = await ServerData.prisma.playlist.findUnique({
            where: {
                userId_name: {
                    userId,
                    name: playlistName,
                },
            },
        });
        if (playlist) {
            const existingTracks = playlist.tracks ? JSON.parse(playlist.tracks) : [];
            if (Array.isArray(existingTracks)) {
                const updatedTracks = [...existingTracks, ...tracks];
                await ServerData.prisma.playlist.update({
                    where: {
                        userId_name: {
                            userId,
                            name: playlistName,
                        },
                    },
                    data: {
                        tracks: JSON.stringify(updatedTracks),
                    },
                });
            } else {
                throw new Error('Existing tracks are not in an array format.');
            }
        } else {
            await ServerData.prisma.playlist.create({
                data: {
                    userId,
                    name: playlistName,
                    tracks: tracksJson,
                },
            });
        }
    }

    /**
     * @param {string} userId
     * @param {string} playlistName
     * @param {string} encodedSong
     */
    async removeSong(userId, playlistName, encodedSong) {
        const playlist = await this.getPlaylist(userId, playlistName);
        if (playlist) {
            const tracks = JSON.parse(playlist?.tracks);
            const songIndex = tracks.indexOf(encodedSong);
            if (songIndex !== -1) {
                tracks.splice(songIndex, 1);
                await ServerData.prisma.playlist.update({
                    where: {
                        userId_name: {
                            userId,
                            name: playlistName,
                        },
                    },
                    data: {
                        tracks: JSON.stringify(tracks),
                    },
                });
            }
        }
    }

    /**
     * @param {string} userId
     * @param {string} playlistName
     */
    async getTracksFromPlaylist(userId, playlistName) {
        const playlist = await ServerData.prisma.playlist.findUnique({
            where: {
                userId_name: {
                    userId,
                    name: playlistName,
                },
            },
        });
        if (!playlist) {
            return null;
        }
        const tracks = JSON.parse(playlist.tracks);
        return tracks;
    }
}