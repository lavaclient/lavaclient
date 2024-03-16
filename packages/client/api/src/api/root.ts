import type { LavalinkHttpClient } from "../client/index.js";

import { SessionAPI } from "./session.js";
import {
    executeDecodeTrack,
    executeDecodeTracks,
    executeInfo,
    executeLoadTracks,
    executeStats,
    executeVersion,
} from "../endpoint/index.js";

export class LavalinkAPI {
    constructor(readonly client: LavalinkHttpClient) {}

    /**
     *
     */
    session(id: string) {
        return new SessionAPI(this, id);
    }

    /**
     * Information on the lavalink node.
     */
    info() {
        return executeInfo(this.client, {});
    }

    /**
     * The version the lavalink node is running.
     */
    version() {
        return executeVersion(this.client, {});
    }

    /**
     * Statistics of the lavalink node.
     */
    stats() {
        return executeStats(this.client, {});
    }

    /**
     * Fetch a load result using the given identifier.
     *
     * @param identifier The identifier to load
     */
    loadTracks(identifier: string) {
        return executeLoadTracks(this.client, { query: { identifier } });
    }

    /**
     * Decode a track.
     *
     * @param encodedTrack The track to decode
     * @returns The decoded track
     */
    decodeTrack(encodedTrack: string) {
        return executeDecodeTrack(this.client, { query: { encodedTrack } });
    }

    /**
     * Decode a list of encoded tracks.
     *
     * @param encodedTracks The tracks to decode
     * @returns The decoded tracks
     */
    decodeTracks(encodedTracks: string[]) {
        return executeDecodeTracks(this.client, { body: encodedTracks });
    }
}
