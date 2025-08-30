/**
 * Transforms a requester object into a standard format.
 * @param {any} requester The requester to transform.
 * @returns {{id: string, username: string, avatarURL?: string, discriminator?: string}} The transformed requester.
 */
export const requesterTransformer = (requester) => {
    if (
        typeof requester === "object" &&
        "avatar" in requester &&
        Object.keys(requester).length === 3
    )
        return requester;
    if (typeof requester === "object" && "displayAvatarURL" in requester) {
        return {
            id: requester.id,
            username: requester.username,
            avatarURL: requester.displayAvatarURL({ extension: "png" }),
            discriminator: requester.discriminator,
        };
    }
    return { id: requester?.toString() || "unknown", username: "unknown" };
};

/**
 * Handles the autoplay functionality.
 * @param {import('lavalink-client').Player} player The Lavalink player instance.
 * @param {import('lavalink-client').Track} lastTrack The last track that was played.
 */
export async function autoPlayFunction(player, lastTrack) {
    if (!player.get("autoplay")) return;
    if (!lastTrack) return;

    if (lastTrack.info.sourceName === "spotify") {
        const filtered = player.queue.previous
            .filter((v) => v.info.sourceName === "spotify")
            .slice(0, 5);
        const ids = filtered.map(
            (v) =>
                v.info.identifier ||
                v.info.uri.split("/")?.reverse()?.[0] ||
                v.info.uri.split("/")?.reverse()?.[1]
        );

        if (ids.length >= 2) {
            const res = await player
                .search(
                    {
                        query: `seed_tracks=${ids.join(",")}`,
                        source: "sprec",
                    },
                    lastTrack.requester
                )
                .then((response) => {
                    response.tracks = response.tracks.filter(
                        (v) => v.info.identifier !== lastTrack.info.identifier
                    );
                    return response;
                })
                .catch(console.warn);

            if (res && res.tracks.length > 0)
                await player.queue.add(
                    res.tracks.slice(0, 5).map((track) => {
                        track.pluginInfo.clientData = {
                            ...(track.pluginInfo.clientData || {}),
                            fromAutoplay: true,
                        };
                        return track;
                    })
                );
        }
        return;
    }

    if (
        lastTrack.info.sourceName === "youtube" ||
        lastTrack.info.sourceName === "youtubemusic"
    ) {
        const res = await player
            .search(
                {
                    query: `https://www.youtube.com/watch?v=${lastTrack.info.identifier}&list=RD${lastTrack.info.identifier}`,
                    source: "youtube",
                },
                lastTrack.requester
            )
            .then((response) => {
                response.tracks = response.tracks.filter(
                    (v) => v.info.identifier !== lastTrack.info.identifier
                );
                return response;
            })
            .catch(console.warn);

        if (res && res.tracks.length > 0)
            await player.queue.add(
                res.tracks.slice(0, 5).map((track) => {
                    track.pluginInfo.clientData = {
                        ...(track.pluginInfo.clientData || {}),
                        fromAutoplay: true,
                    };
                    return track;
                })
            );
        return;
    }

    if (lastTrack.info.sourceName === "jiosaavn") {
        const res = await player.search(
            { query: `jsrec:${lastTrack.info.identifier}`, source: "jsrec" },
            lastTrack.requester
        );
        if (res.tracks.length > 0) {
            const track = res.tracks.filter(
                (v) => v.info.identifier !== lastTrack.info.identifier
            )[0];
            await player.queue.add(track);
        }
    }
    return;
}

/**
 * Applies a fair play algorithm to the queue.
 * @param {import('lavalink-client').Player} player The Lavalink player instance.
 * @returns {Promise<import('lavalink-client').Track[]>} The new queue.
 */
export async function applyFairPlayToQueue(player) {
    const tracks = [...player.queue.tracks];
    const requesterMap = new Map();

    for (const track of tracks) {
        const requesterId = track.requester.id;
        if (!requesterMap.has(requesterId)) {
            requesterMap.set(requesterId, []);
        }
        requesterMap.get(requesterId)?.push(track);
    }

    const fairQueue = [];
    const requesterIndices = new Map();
    for (const requesterId of requesterMap.keys()) {
        requesterIndices.set(requesterId, 0);
    }

    let tracksAdded = 0;
    while (tracksAdded < tracks.length) {
        for (const [requesterId, trackList] of requesterMap.entries()) {
            const currentIndex = requesterIndices.get(requesterId);
            if (currentIndex < trackList.length) {
                fairQueue.push(trackList[currentIndex]);
                requesterIndices.set(requesterId, currentIndex + 1);
                tracksAdded++;
            }
        }
    }

    await player.queue.splice(0, player.queue.tracks.length);
    await player.queue.add(fairQueue);
    return fairQueue;
}