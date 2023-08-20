import type { Node } from "./node.js";
import type { PlayerAPI } from "lavalink-api-client";

import type * as Protocol from "lavalink-protocol";
import { Emitter } from "./tools.js";
import { PlayerVoice } from "./playerVoice.js";

import type { DeepWritable } from "ts-essentials";

export class Player extends Emitter<PlayerEvents> {
    /**
     * The api for this player.
     */
    readonly api: PlayerAPI;

    /**
     * The voice mananger for this player.
     */
    readonly voice: PlayerVoice;

    /**
     * Whether this player is currently playing something.
     */
    playing = false;

    /**
     * The timestamp in which this player became aware of {@link track}.
     */
    playingTimestamp?: number;

    /**
     * The ID of the guild this player is connected to.
     */
    track: Protocol.Track | null = null;

    /**
     * The filters for this player.
     */
    filters: Protocol.Filters = {};

    /**
     * The position of the current track (in milliseconds).
     */
    position = 0;

    /**
     * The volume of the player, range 0-1000, in percentage.
     */
    volume = 100;

    /**
     * Whether the player is paused.
     */
    paused = false;

    /**
     * Unix Timestamp of when this player was last updated.
     */
    lastUpdate?: number;

    /**
     * @param node The lavalink node that governs this player.
     * @param id   The ID of the guild this player is for.
     */
    constructor(
        readonly node: Node,
        readonly id: string,
    ) {
        const session = node.ws.session;
        if (!session) {
            throw new Error("Cannot create player without a session.");
        }

        super();

        this.id = id;
        this.api = session.player(id);
        this.node = node;
        this.voice = new PlayerVoice(this);
    }

    // high-level utilities.

    /**
     * Plays the given {@link track}.
     *
     * @param track   The track to play.
     * @param options The options for playing the track.
     * @returns This player (but updated).
     */
    play(
        track: string | { encoded: string },
        options?: Omit<Protocol.RESTPatchAPIPlayerJSONBody, "encodedTrack" | "identifier" | "voice">,
    ) {
        const encodedTrack = typeof track === "string" ? track : track.encoded;
        return this.update({ encodedTrack, ...options });
    }

    /**
     * Stop the currently playing track.
     * @returns This player (but updated).
     */
    stop(other: Omit<Protocol.RESTPatchAPIPlayerJSONBody, "encodedTrack">) {
        return this.update({ encodedTrack: null, ...other });
    }

    /**
     * Sets the pause state of the player.
     *
     * @param paused Whether to pause the player.
     * @returns This player (but updated).
     */
    pause(paused = true, other: Omit<Protocol.RESTPatchAPIPlayerJSONBody, "paused"> = {}) {
        return this.update({ paused, ...other });
    }

    /**
     * Resumes the currently playing track.
     *
     * @returns This player (but updated).
     */
    resume(other: Omit<Protocol.RESTPatchAPIPlayerJSONBody, "paused"> = {}) {
        return this.pause(false, other);
    }

    /**
     * Seeks to the given position in the currently playing track.
     *
     * @param position The position to seek to.
     * @returns This player (but updated).
     */
    seek(position: number, other: Omit<Protocol.RESTPatchAPIPlayerJSONBody, "position"> = {}) {
        return this.update({ position, ...other });
    }

    /**
     * Sets the volume of the player.
     *
     * @param volume The volume to set.
     * @returns This player (but updated.
     */
    setVolume(volume: number, other: Omit<Protocol.RESTPatchAPIPlayerJSONBody, "volume"> = {}) {
        return this.update({ volume, ...other });
    }

    /**
     * Sets the filters of the player, this overwrites any previously applied filters.
     *
     * @param filters The filters to set.
     * @returns This player (but updated).
     */
    setFilters(filters: Protocol.Filters): Promise<this>;

    /**
     * Sets a specific filter of the player, this uses the cached filter values.
     *
     * @param filter The name of the filter to set.
     * @param value  The value to set the filter to.
     * @returns This player (but updated).
     */
    setFilters<K extends keyof Protocol.Filters>(filter: K, value: Protocol.Filters[K]): Promise<this>;

    /**
     * Sets a specific plugin filter of the player, this uses the cached filter values.
     *
     * @param filter The name of the filter to set.
     * @param value  The value to set the filter to.
     * @param plugin Whether the filter is a plugin filter.
     * @returns This player (but updated).
     */
    setFilters(filter: string, value: unknown, plugin: true): Promise<this>;

    setFilters(arg0: Protocol.Filters | string, value?: unknown, plugin = false): Promise<this> {
        if (typeof arg0 === "object") {
            return this.update({ filters: arg0 });
        }

        const filters = this.filters as DeepWritable<Protocol.Filters>;
        if (plugin) {
            filters.pluginFilters ??= {};
            filters.pluginFilters[arg0] = value;
        } else {
            // @ts-expect-error - this should be fine lol, we have validation anyways.
            filters[arg0] = value;
        }

        return this.update({ filters });
    }

    // low-level things

    /**
     * Fetches the player data from the API and returns whether it exists.
     *
     * @returns Whether this player exists on the lavalink node.
     */
    async fetch(): Promise<boolean> {
        const data = await this.api.fetchOrNull();
        if (data) this.patch(data);
        return !!data;
    }

    /**
     * Updates this player with the provided data.
     *
     * @param body      The data to update the player with.
     * @param noReplace If you do not want the current playing track to get replaced provide `true`.
     * @returns This player (but updated).
     */
    async update(body: Protocol.RESTPatchAPIPlayerJSONBody, noReplace = false) {
        const data = await this.api.update(body, noReplace);
        return this.patch(data);
    }

    /**
     * Updates this player with the provided data.
     * **Warning:** this is an internal method, and should not be used by users.
     *
     * @param data The data to patch this player with.
     */
    patch(data: Protocol.Player): this {
        this.voice.server = data.voice;

        if (data.track) {
            this.playingTimestamp = this.track === data.track ? this.playingTimestamp : Date.now();
            this.playing = data.track != null;
            this.track = data.track;
        } else {
            delete this.playingTimestamp;
            this.playing = false;
            this.track = null;
        }

        this.filters = data.filters;
        this.volume = data.volume;
        this.paused = data.paused;

        return this.patchWithState(data.state);
    }

    /**
     * Updates this player with the provided player state.
     * **Warning:** this is an internal method, and should not be used by users.
     * 
     * @param data The player state to patch this player with.
     */
    patchWithState(data: Protocol.PlayerState) {
        this.voice.latency = data.ping;
        this.voice.connected = data.connected;
        this.position = data.position;
        this.lastUpdate = data.time;
        return this;
    }

    /**
     * Handles an event received from the lavalink node.
     * **Warning:** this is an internal method, and should not be used by users.
     *
     * @param event The player event that was received.
     */
    handleEvent(event: Protocol.Event): void {
        switch (event.type) {
            case "TrackStartEvent":
                this.playing = true;
                this.playingTimestamp = Date.now();
                this.track = event.track;

                this.emit("trackStart", event.track);
                break;
            case "TrackEndEvent":
                if (event.reason !== "replaced") {
                    this.playing = false;
                    delete this.playingTimestamp;
                }

                this.track = null;

                this.emit("trackEnd", event.track, event.reason);
                break;
            case "TrackExceptionEvent":
                this.emit("trackException", event.track, event.exception);
                break;
            case "TrackStuckEvent":
                this.emit("trackStuck", event.track, event.thresholdMs);
                break;
            case "WebSocketClosedEvent":
                this.emit("disconnected", event.code, event.reason, event.byRemote);
                break;
        }
    }
}

export type PlayerEvents = {
    disconnected: (code: number, reason: string, byRemote: boolean) => void;
    updated: () => void;
    trackStart: (track: Protocol.Track) => void;
    trackEnd: (track: Protocol.Track, reason: Protocol.TrackEndReason) => void;
    trackException: (track: Protocol.Track, exception: Protocol.Exception) => void;
    trackStuck: (track: Protocol.Track, thresholdMs: number) => void;
};
