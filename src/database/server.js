"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const env_1 = require("../env");
class ServerData {
    static prisma = new client_1.PrismaClient();
    prisma;
    constructor() {
        this.prisma = ServerData.prisma;
    }
    async get(guildId) {
        return ((await this.prisma.guild.findUnique({ where: { guildId } })) ??
            this.createGuild(guildId));
    }
    async createGuild(guildId) {
        return await this.prisma.guild.create({
            data: {
                guildId,
                prefix: env_1.env.PREFIX,
            },
        });
    }
    async setPrefix(guildId, prefix) {
        await this.prisma.guild.upsert({
            where: { guildId },
            update: { prefix },
            create: { guildId, prefix },
        });
    }
    async getPrefix(guildId) {
        const guild = await this.get(guildId);
        return guild?.prefix ?? env_1.env.PREFIX;
    }
    async updateLanguage(guildId, language) {
        await this.prisma.guild.update({
            where: { guildId },
            data: { language },
        });
    }
    async getLanguage(guildId) {
        const guild = await this.get(guildId);
        return guild?.language ?? env_1.env.DEFAULT_LANGUAGE;
    }
    async getSetup(guildId) {
        return await this.prisma.setup.findUnique({ where: { guildId } });
    }
    async setSetup(guildId, textId, messageId) {
        await this.prisma.setup.upsert({
            where: { guildId },
            update: { textId, messageId },
            create: { guildId, textId, messageId },
        });
    }
    async deleteSetup(guildId) {
        await this.prisma.setup.delete({ where: { guildId } });
    }
    async set_247(guildId, textId, voiceId) {
        await this.prisma.stay.upsert({
            where: { guildId },
            update: { textId, voiceId },
            create: { guildId, textId, voiceId },
        });
    }
    async delete_247(guildId) {
        await this.prisma.stay.delete({ where: { guildId } });
    }
    async get_247(guildId) {
        if (guildId) {
            const stay = await this.prisma.stay.findUnique({ where: { guildId } });
            if (stay)
                return stay;
            return null;
        }
        return this.prisma.stay.findMany();
    }
    async setDj(guildId, mode) {
        await this.prisma.dj.upsert({
            where: { guildId },
            update: { mode },
            create: { guildId, mode },
        });
    }
    async getDj(guildId) {
        return await this.prisma.dj.findUnique({ where: { guildId } });
    }
    async getRoles(guildId) {
        return await this.prisma.role.findMany({ where: { guildId } });
    }
    async addRole(guildId, roleId) {
        await this.prisma.role.create({ data: { guildId, roleId } });
    }
    async removeRole(guildId, roleId) {
        await this.prisma.role.deleteMany({ where: { guildId, roleId } });
    }
    async clearRoles(guildId) {
        await this.prisma.role.deleteMany({ where: { guildId } });
    }
    async getPlaylist(userId, name) {
        return await this.prisma.playlist.findUnique({
            where: { userId_name: { userId, name } },
        });
    }
    async getUserPlaylists(userId) {
        return await this.prisma.playlist.findMany({
            where: { userId },
        });
    }
    async createPlaylist(userId, name) {
        await this.prisma.playlist.create({ data: { userId, name } });
    }
    async createPlaylistWithTracks(userId, name, tracks) {
        await this.prisma.playlist.create({
            data: {
                userId,
                name,
                tracks: JSON.stringify(tracks),
            },
        });
    }
    async deletePlaylist(userId, name) {
        await this.prisma.playlist.delete({
            where: { userId_name: { userId, name } },
        });
    }
    async deleteSongsFromPlaylist(userId, playlistName) {
        const playlist = await this.getPlaylist(userId, playlistName);
        if (playlist) {
            await this.prisma.playlist.update({
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
    async addTracksToPlaylist(userId, playlistName, tracks) {
        const tracksJson = JSON.stringify(tracks);
        const playlist = await this.prisma.playlist.findUnique({
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
                await this.prisma.playlist.update({
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
            }
            else {
                throw new Error("Existing tracks are not in an array format.");
            }
        }
        else {
            await this.prisma.playlist.create({
                data: {
                    userId,
                    name: playlistName,
                    tracks: tracksJson,
                },
            });
        }
    }
    async removeSong(userId, playlistName, encodedSong) {
        const playlist = await this.getPlaylist(userId, playlistName);
        if (playlist) {
            const tracks = JSON.parse(playlist?.tracks);
            const songIndex = tracks.indexOf(encodedSong);
            if (songIndex !== -1) {
                tracks.splice(songIndex, 1);
                await this.prisma.playlist.update({
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
    async getTracksFromPlaylist(userId, playlistName) {
        const playlist = await this.prisma.playlist.findUnique({
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
exports.default = ServerData;
