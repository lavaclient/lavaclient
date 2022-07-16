/* eslint-disable camelcase */
import { DiscordResource, getId, Snowflake } from "./Utils";
import Lavalink, { Filter } from "@lavaclient/types";
import { TypedEmitter } from "tiny-typed-emitter";

import type { Node } from "./node/Node";
import { decode } from "./track/Track";

/** @internal */
const _voiceUpdate = Symbol.for("Player#_voiceUpdate");
/** @internal */
const _volume = Symbol.for("Player#_volume");

export class Player<N extends Node = Node> extends TypedEmitter<PlayerEvents> {
    static USE_FILTERS = false;

    readonly guildId: Snowflake;

    channelId: string | null = null;
    track?: string;
    trackData?: Lavalink.TrackInfo;
    playing = false;
    playingSince?: number;
    paused = false;
    connected = false;
    filters: Partial<Lavalink.FilterData> = {};

    lastPosition?: number;
    lastUpdate?: number;

    private [_voiceUpdate]: Partial<Lavalink.VoiceUpdateData> = {};
    private [_volume] = 100;

    constructor(readonly node: N, guild: Snowflake | DiscordResource) {
        super();

        this.guildId = getId(guild);
    }

    /**
     * @deprecated use {@link Player#position}
     */
    get accuratePosition() {
        return this.position;
    }

    get position(): number | undefined {
        const lastPosition = this.lastPosition
            , lastUpdate = this.lastUpdate;
        if (lastPosition == null) return;

        const length = this.trackData?.length;
        if (lastUpdate == null || length == null) {
            return lastPosition;
        }

        return this.paused
            ? Math.min(lastPosition, length)
            : Math.min(lastPosition + (Date.now() - lastUpdate), length);
    }

    get volume(): number {
        return Player.USE_FILTERS
            ? Math.floor((this.filters.volume ?? 1) * 100)
            : this[_volume];
    }

    /* voice connection management. */
    connect(channel: Snowflake | DiscordResource | null, options: ConnectOptions = {}): this {
        this[_voiceUpdate] = {};

        this.node.debug("voice", `updating voice status in guild=${this.guildId}, channel=${this.channelId}`, this);
        this.node.sendGatewayPayload(this.guildId, {
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: channel && getId(channel),
                self_deaf: options.deafened ?? false,
                self_mute: options.muted ?? false
            }
        });

        return this;
    }

    disconnect(): this {
        this[_voiceUpdate] = {};

        return this.connect(null);
    }

    /* lavalink operations. */
    async play(track: string | { track: string }, options: PlayOptions = {}): Promise<this> {
        await this.node.conn.send(false, {
            op: "play",
            track: typeof track === "string" ? track : track.track,
            guildId: this.guildId,
            ...options
        });

        return this;
    }

    async stop(): Promise<this> {
        await this.node.conn.send(false, { op: "stop", guildId: this.guildId });
        return this;
    }

    async pause(state = true): Promise<this> {
        this.paused = state;
        await this.node.conn.send(false, { op: "pause", guildId: this.guildId, pause: state });
        return this;
    }

    resume(): Promise<this> {
        return this.pause(false);
    }

    async seek(position: number): Promise<this> {
        await this.node.conn.send(false, { op: "seek", guildId: this.guildId, position });
        return this;
    }

    async destroy(): Promise<this> {
        await this.node.conn.send(false, { op: "destroy", guildId: this.guildId });
        return this;
    }

    async setVolume(volume: number): Promise<this> {
        if (Player.USE_FILTERS) {
            await this.setFilters(Filter.Volume, volume > 1 ? volume / 100 : volume);
        } else {
            await this.node.conn.send(false, { op: "volume", guildId: this.guildId, volume });
            this[_volume] = volume;
        }

        return this;
    }

    setEqualizer(...gains: number[]): Promise<this>;
    setEqualizer(...bands: Lavalink.EqualizerBand[]): Promise<this>;
    async setEqualizer(
        arg0: number | Lavalink.EqualizerBand | (Lavalink.EqualizerBand | number)[],
        ...arg1: (number | Lavalink.EqualizerBand)[]
    ): Promise<this> {
        const bands: Lavalink.EqualizerBand[] = [];
        if (Array.isArray(arg0)) {
            arg0.forEach((value, index) => {
                bands.push(typeof value === "number" ? { gain: value, band: index } : value);
            });
        } else {
            bands.push(typeof arg0 === "number" ? { gain: arg0, band: 0 } : arg0);
            arg1.forEach(value => {
                const band = typeof value === "number" ? { gain: value, band: bands.length } : value;
                bands.push(band);
            });
        }

        const duplicateBand = bands.find(a => bands.filter(b => a.band === b.band).length > 1)?.band;
        if (duplicateBand) {
            throw new Error(`Band ${duplicateBand} is duplicated 1 or more times.`);
        }

        /* apply the equalizer */
        await (Player.USE_FILTERS
            ? this.setFilters(Filter.Equalizer, bands)
            : this.node.conn.send(false, { op: "equalizer", guildId: this.guildId, bands }));

        return this;
    }

    setFilters(): Promise<this>;
    setFilters(filters: Partial<Lavalink.FilterData>): Promise<this>;
    setFilters<F extends Filter>(filter: F, data: Lavalink.FilterData[F]): Promise<this>;
    async setFilters<F extends Filter>(
        arg0?: Partial<Lavalink.FilterData> | F,
        arg1?: Lavalink.FilterData[F]
    ): Promise<this> {
        if (typeof arg0 === "object") {
            this.filters = arg0;
        } else if (arg0) {
            this.filters[arg0] = arg1;
        }

        await this.node.conn.send(false, {
            op: "filters",
            guildId: this.guildId,
            ...this.filters
        });

        return this;
    }

    /* event handling. */
    async handleVoiceUpdate(update: VoiceStateUpdate | VoiceServerUpdate): Promise<this> {
        if ("token" in update) {
            this[_voiceUpdate].event = update;
        } else {
            if (update.user_id !== this.node.userId) {
                return this;
            }

            const channel = update.channel_id;
            if (!channel && this.channelId) {
                this.emit("channelLeave", this.channelId);
                this.channelId = null;
                this[_voiceUpdate] = {};
            } else if (channel && !this.channelId) {
                this.channelId = update.channel_id;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.emit("channelJoin", this.channelId!);
            } else if (channel !== this.channelId) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.emit("channelMove", this.channelId!, update.channel_id!);
                this.channelId = update.channel_id;
            }

            if (this[_voiceUpdate].sessionId === update.session_id) {
                return this;
            }

            this[_voiceUpdate].sessionId = update.session_id;
        }

        if (this[_voiceUpdate].event && this[_voiceUpdate].sessionId) {
            this.node.debug("voice", "submitting voice update", this);
            await this.node.conn.send(true, {
                op: "voiceUpdate",
                guildId: this.guildId,
                ...this[_voiceUpdate] as Lavalink.VoiceUpdateData
            });

            this.connected = true;
        }

        return this;
    }

    handleEvent(event: Lavalink.PlayerEvent): void {
        switch (event.type) {
            case "TrackStartEvent":
                this.playing = true;
                this.playingSince = Date.now();
                this.track = event.track;
                try {
                    this.trackData = decode(event.track) ?? undefined;
                } catch {/*no-op*/
                }
                this.emit("trackStart", event.track);
                break;
            case "TrackEndEvent":
                if (event.reason !== "REPLACED") {
                    this.playing = false;
                    delete this.playingSince;
                }

                delete this.track;
                delete this.trackData;

                this.emit("trackEnd", event.track, event.reason);
                break;
            case "TrackExceptionEvent":
                this.emit("trackException", event.track, new Error(event.error));
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

export type PlayOptions = Omit<Lavalink.PlayData, "track">;

export interface PlayerEvents {
    disconnected: (code: number, reason: string, byRemote: boolean) => void;
    trackStart: (track: string) => void;
    trackEnd: (track: string | null, reason: Lavalink.TrackEndReason) => void;
    trackException: (track: string | null, error: Error) => void;
    trackStuck: (track: string | null, thresholdMs: number) => void;
    channelJoin: (joined: Snowflake) => void;
    channelLeave: (left: Snowflake) => void;
    channelMove: (from: Snowflake, to: Snowflake) => void;
}

export interface ConnectOptions {
    deafened?: boolean;
    muted?: boolean;
}

export interface VoiceServerUpdate {
    token: string;
    endpoint: string;
    guild_id: `${bigint}`;
}

export interface VoiceStateUpdate {
    session_id: string;
    channel_id: `${bigint}` | null;
    guild_id: `${bigint}`;
    user_id: `${bigint}`;
}
