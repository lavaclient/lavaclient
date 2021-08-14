import { DiscordResource, getId, Snowflake } from "./Utils";
import {
    EqualizerBand,
    Filter,
    FilterData,
    PlayData,
    PlayerEvent,
    TrackEndReason,
    VoiceUpdateData
} from "@lavaclient/types";
import { EventBus, ListenerMap } from "@dimensional-fun/common";

import type { Node } from "./node/Node";

/** @internal */
const _voiceUpdate = Symbol.for("Player#_voiceUpdate");
/** @internal */
const _volume = Symbol.for("Player#_volume");

export class Player<N extends Node = Node> extends EventBus<PlayerEvents> {
    static USE_FILTERS = false;

    readonly guildId: Snowflake;

    channelId: string | null = null;
    track?: string;
    playing = false;
    playingSince?: number;
    paused = false;
    position?: number;
    connected = false;
    filters: Partial<FilterData> = {};

    private [_voiceUpdate]: Partial<VoiceUpdateData> = {};
    private [_volume] = 100;

    constructor(readonly node: N, guild: Snowflake | DiscordResource) {
        super();

        this.guildId = getId(guild);
    }

    get volume(): number {
        return Player.USE_FILTERS
            ? Math.floor((this.filters.volume ?? 1) * 100)
            : this[_volume];
    }

    /* voice connection management. */
    connect(channel: Snowflake | DiscordResource | null, options: ConnectOptions = {}): this {
        this.channelId = channel && getId(channel);

        this.node.debug("voice", `updating voice status in guild=${this.guildId}, channel=${this.channelId}`, this);
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
    setEqualizer(...bands: EqualizerBand[]): Promise<this>;
    async setEqualizer(
        arg0: number | EqualizerBand | (EqualizerBand | number)[],
        ...arg1: (number | EqualizerBand)[]
    ): Promise<this> {
        const bands: EqualizerBand[] = [];
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
    setFilters(filters: Partial<FilterData>): Promise<this>;
    setFilters<F extends Filter>(filter: F, data: FilterData[F]): Promise<this>;
    async setFilters<F extends Filter>(
        arg0?: Partial<FilterData> | F,
        arg1?: FilterData[F]
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

            if (update.channel_id && this.channelId !== update.channel_id) {
                this.emit("channelMove", this.channelId, update.channel_id);
            }

            this[_voiceUpdate].sessionId = update.session_id;
        }

        if (this[_voiceUpdate].event && this[_voiceUpdate].sessionId) {
            this.node.debug("voice", "submitting voice update", this);
            await this.node.conn.send(true, {
                op: "voiceUpdate",
                guildId: this.guildId,
                ...this[_voiceUpdate] as VoiceUpdateData
            });

            this.connected = true;
        }

        return this;
    }

    handleEvent(event: PlayerEvent) {
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
                    delete this.playingSince;
                }

                delete this.track;
                this.emit("trackEnd", event.track, event.reason);
                break;
            case "TrackExceptionEvent":
                this.emit("trackException", event.track, new Error(event.error));
                break;
            case "TrackStuckEvent":
                this.emit("trackStuck", event.track, event.thresholdMs);
                break;
            case "WebSocketClosedEvent":
                this.channelId = null;
                this.emit("channelLeave", event.code, event.reason, event.byRemote);
                break;
        }
    }
}

export type PlayOptions = Omit<PlayData, "track">;

export interface PlayerEvents extends ListenerMap {
    trackStart: [ track: string ];
    trackEnd: [ track: string | null, reason: TrackEndReason ];
    trackException: [ track: string | null, error: Error ];
    trackStuck: [ track: string | null, thresholdMs: number ];
    channelLeave: [ code: number, reason: string, byRemote: boolean ];
    channelMove: [ from: Snowflake | null, to: Snowflake | null ];
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
