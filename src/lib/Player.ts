import { Emitter } from "./Utils";
import * as Lavalink from "@lavaclient/types";

import type { Node } from "./node/Node";
import type { DiscordResource, Snowflake } from "../constants";

const _voiceUpdate = Symbol("Player#_voiceUpdate")
const _volume = Symbol("Player#_volume")

export class Player<N extends Node = Node> extends Emitter<PlayerEvents> {
    static USE_FILTERS = false;

    readonly node: N;
    readonly guildId: Snowflake;

    channelId?: string;
    track?: string;
    playing = false;
    playingSince?: number;
    paused = false;
    position?: number;
    connected = false;
    filters: Partial<Lavalink.FilterData> = {};

    private [_voiceUpdate]: Partial<Lavalink.VoiceUpdateData> = {};
    private [_volume] = 100;

    constructor(node: N, guild: Snowflake | DiscordResource) {
        super();

        this.node = node;
        this.guildId = typeof guild === "string" ? guild : guild.id;
    }

    get volume(): number {
        return Player.USE_FILTERS
            ? Math.floor((this.filters.volume ?? 1) * 100)
            : this[_volume];
    }

    /* voice connection management. */
    connect(channel: Snowflake | DiscordResource | null, options: ConnectOptions = {}): this {
        this.channelId = typeof channel === "string"
            ? channel
            : channel?.id;

        this.node.sendGatewayPayload(this.guildId, {
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: this.channelId,
                self_deaf: options.deafened ?? false,
                self_mute: options.muted ?? false
            }
        });

        return this;
    }

    disconnect(): this {
        return this.connect(null);
    }

    /* lavalink operations. */
    async play(track: string | { track: string }, options: PlayOptions) {
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

    async pause(state = true) {
        this.paused = state;
        await this.node.conn.send(false, { op: "pause", guildId: this.guildId, pause: state })
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
            await this.setFilters(Lavalink.Filter.Volume, volume > 1 ? volume / 100 : volume);
        } else {
            await this.node.conn.send(false, { op: "volume", guildId: this.guildId, volume });
            this[_volume] = volume;
        }

        return this;
    }

    setEqualizer(gains: number[]): Promise<this>;
    setEqualizer(...gains: number[]): Promise<this>;
    setEqualizer(bands: Lavalink.EqualizerBand[]): Promise<this>;
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
                const band =
                    typeof value === "number" ? { gain: value, band: bands.length } : value;
                bands.push(band);
            });
        }

        const duplicateBand = bands.find(a => bands.filter(b => a.band === b.band).length > 1)?.band;
        if (duplicateBand) {
            throw new Error(`Band ${duplicateBand} is duplicated 1 or more times.`);
        }

        /* apply the equalizer */
        await (Player.USE_FILTERS
            ? this.setFilters(Lavalink.Filter.Equalizer, bands)
            : this.node.conn.send(false, { op: "equalizer", guildId: this.guildId, bands }));

        return this;
    }


    setFilters(): Promise<this>;
    setFilters(filters: Partial<Lavalink.FilterData>): Promise<this>;
    setFilters<F extends Lavalink.Filter>(filter: F, data: Lavalink.FilterData[F]): Promise<this>;
    async setFilters<F extends Lavalink.Filter>(
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
            ...this.filters,
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

            if (update.channel_id && this.channelId !== update.channel_id) {
                this.emit("channelMove", this.channelId, update.channel_id)
            }

            this[_voiceUpdate].sessionId = update.session_id;
        }

        if (this[_voiceUpdate].event && this[_voiceUpdate].sessionId) {
            await this.node.conn.send(true, {
                op: "voiceUpdate",
                guildId: this.guildId,
                ...this[_voiceUpdate] as Lavalink.VoiceUpdateData
            });

            this.connected = true;
        }

        return this;
    }

    handleEvent(event: Lavalink.PlayerEvent) {
        switch (event.type) {
            case "TrackStartEvent":
                this.playing = true;
                this.playingSince = Date.now();
                this.track = event.track;
                this.emit("trackStart", event.track);
                break;
            case "TrackEndEvent":
                if (event.reason !== "REPLACED") {
                    this.playing = false;
                    this.playingSince = undefined;
                }

                this.track = undefined;
                this.emit("trackEnd", event.track, event.reason);
                break;
            case "TrackExceptionEvent":
                this.emit("trackException", event.track, new Error(event.error));
                break;
            case "TrackStuckEvent":
                this.emit("trackStuck", event.track, event.thresholdMs);
                break;
            case "WebSocketClosedEvent":
                this.channelId = undefined;
                this.emit("channelLeave", event.code, event.reason, event.byRemote);
                break;
        }
    }
}

export type PlayOptions = Omit<Lavalink.PlayData, "track">;

export type PlayerEvents = {
    trackStart: (track: string) => void;
    trackEnd: (track: string | null, reason: Lavalink.TrackEndReason) => void;
    trackException: (track: string | null, error: Error) => void;
    trackStuck: (track: string | null, thresholdMs: number) => void;
    channelLeave: (code: number, reason: string, byRemote: boolean) => void;
    channelMove: (from?: Snowflake, to?: Snowflake) => void;
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
