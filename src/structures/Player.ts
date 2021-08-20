import { EventEmitter } from "events";
import { Structures } from "../Structures";

import type Lavalink from "@lavaclient/types";
import type { Filters } from "./Filters";
import type { Socket } from "./Socket";
import type {
    Dictionary,
    DiscordResource,
    DiscordSnowflake,
    DiscordVoiceServer,
    DiscordVoiceState,
    Manager
} from "./Manager";

export class Player extends EventEmitter {
    /**
     * The id of the guild this player belongs to.
     */
    readonly guild: DiscordSnowflake;

    /**
     * The socket this player belongs to.
     */
    socket: Socket;

    /**
     * The id of the voice channel this player is connected to.
     */
    channel?: DiscordSnowflake;

    /**
     * Whether this player is paused or not.
     */
    paused: boolean;

    /**
     * The current playing track.
     */
    track?: string;

    /**
     * Whether this player is playing or not.
     */
    playing: boolean;

    /**
     * The unix timestamp in which this player started playing.
     */
    timestamp?: number;

    /**
     * Track position in milliseconds.
     */
    position: number;

    /**
     * The current volume of this player.
     */
    volume: number;

    /**
     * Equalizer bands this player is using.
     */
    equalizer: Lavalink.EqualizerBand[];

    /**
     * If this player is connected to a voice channel.
     */
    connected: boolean;

    /**
     * The voice state for this player.
     * @internal
     */
    private _sessionId?: string;

    /**
     * The voice server for this player.
     * @internal
     */
    private _server?: DiscordVoiceServer;

    /**
     * The filters instance.
     * @private
     */
    #filters?: Filters;

    /**
     * @param socket The socket this player belongs to.
     * @param guild The guild that this player is for.
     */
    constructor(socket: Socket, guild: DiscordSnowflake) {
        super();

        this.socket = socket;
        this.guild = guild;

        this.paused = false;
        this.playing = false;
        this.position = 0;
        this.volume = 100;
        this.equalizer = [];
        this.connected = false;

        this.on("playerUpdate", this._playerUpdate.bind(this));
        this.on("event", this._event.bind(this));
    }

    /**
     * The filters instance
     * @since 3.2.0
     */
    get filters(): Filters {
        if (!this.#filters) {
            this.#filters = new (Structures.get("filters"))(this);
        }

        return this.#filters;
    }

    /**
     * The head manager of everything.
     * @since 2.1.0
     */
    get manager(): Manager {
        return this.socket.manager;
    }

    /**
     * Connects to the specified voice channel.
     * @param channel A channel id or object.
     * @param options Options for self mute, self deaf, or force connecting.
     * @since 2.1.x
     */
    connect(channel: DiscordSnowflake | DiscordResource | null, options: ConnectOptions = {}): this {
        const channelId = typeof channel === "object"
            ? channel?.id
            : channel;

        this.channel = channelId;
        this.socket.manager.send(this.guild, {
            op: 4,
            d: {
                guild_id: this.guild,
                channel_id: channelId ?? null,
                self_deaf: options.selfDeaf ?? false,
                self_mute: options.selfMute ?? false
            }
        });

        return this;
    }

    /**
     * Disconnect from the voice channel.
     * @since 2.1.x
     */
    disconnect(): this {
        return this.connect(null);
    }

    /**
     * Moves this player to another socket.
     * @param socket The socket to move to.
     * @since 3.0.14
     */
    async move(socket: Socket): Promise<Player> {
        this.socket = socket;

        await this.destroy();
        if (this.channel) {
            this.connect(this.channel);
        }

        return this;
    }

    /**
     * Plays the specified base64 track.
     * @param track The track to play.
     * @param options Play options to send along with the track.
     * @since 1.x.x
     */
    play(track: string | Lavalink.Track, options: PlayOptions = {}): this {
        track = typeof track === "string" ? track : track.track;
        return this.send("play", Object.assign({ track }, options));
    }

    /**
     * Change the volume of the player. You can omit the volume param to reset back to 100
     * @param volume May range from 0 to 1000, defaults to 100
     */
    setVolume(volume: number = 100): this {
        if (volume < 0 || volume > 1000) {
            throw new RangeError(`Player#setVolume (${this.guild}): Volume must be within the 0 to 1000 range.`);
        }

        this.volume = volume;
        return this.send("volume", { volume });
    }

    /**
     * Change the paused state of this player. `true` to pause, `false` to resume.
     * @param state Pause state, defaults to true.
     * @since 1.x.x
     */
    pause(state = true): this {
        this.paused = state;
        this.playing = !state;
        return this.send("pause", { pause: state });
    }

    /**
     * Resumes the player, if paused.
     * @since 1.x.x
     */
    resume(): this {
        return this.pause(false);
    }

    /**
     * Stops the current playing track.
     * @since 1.x.x
     */
    stop(): this {
        delete this.track;
        delete this.timestamp;
        this.position = 0;

        return this.send("stop");
    }

    /**
     * Seek to a position in the current song.
     * @param position The position to seek to in milliseconds.
     */
    seek(position: number): this {
        if (!this.track) {
            throw new Error(`Player#seek() ${this.guild}: Not playing anything.`);
        }
        return this.send("seek", { position });
    }

    /**
     * Sets the equalizer of this player.
     * @param bands Equalizer bands to use.
     * @param asFilter Whether to use the filters api instead.
     * @since 2.1.x
     *
     * @deprecated Please use Filters#equalizer and Filters#apply
     */
    setEqualizer(bands: Lavalink.EqualizerBand[], asFilter = false): this {
        if (asFilter) {
            this.filters.equalizer = bands;
            this.filters.apply();
        } else {
            this.send("equalizer", { bands });
        }

        return this;
    }

    /**
     * Destroy this player.
     * @param disconnect Disconnect from the voice channel.
     * @since 1.x.x
     */
    destroy(disconnect = false): this {
        if (disconnect) {
            this.disconnect();
        }

        return this.send("destroy");
    }

    /**
     * Provide a voice update from discord.
     * @since 1.x.x
     * @private
     */
    async handleVoiceUpdate(update: DiscordVoiceState | DiscordVoiceServer): Promise<this> {
        "token" in update
            ? this._server = update
            : this._sessionId = update.session_id;

        if (this._sessionId && this._server) {
            await this.send("voiceUpdate", {
                sessionId: this._sessionId,
                event: this._server
            });

            this.connected = true;
        }

        return this;
    }

    /**
     * Send data to lavalink as this player.
     * @param op The operation.
     * @param data The data.
     * @param priority Whether or not this is a prioritized operation.
     * @since 1.0.0
     */
    send(op: Lavalink.OpCode, data: Dictionary = {}, priority = false): this {
        data.guildId ??= this.guild;
        // @ts-expect-error
        this.socket.send({ op, ...data }, priority);

        return this;
    }

    /**
     * @private
     */
    private async _event(event: Lavalink.PlayerEvent): Promise<void> {
        switch (event.type) {
            case "TrackEndEvent":
                if (event.reason !== "REPLACED") {
                    this.playing = false;
                }

                this.timestamp = this.track = undefined;
                this.emit("end", event);

                break;
            case "TrackExceptionEvent":
                this.emit("error", event);
                break;
            case "TrackStartEvent":
                this.playing = true;
                this.track = event.track;
                this.emit("start", event);
                break;
            case "TrackStuckEvent":
                await this.stop();
                this.emit("stuck", event);
                break;
            case "WebSocketClosedEvent":
                this.emit("closed", event);
                break;
        }
    }

    /**
     * @private
     */
    private _playerUpdate(update: Lavalink.PlayerUpdate): void {
        if (!update.state) {
            return;
        }

        this.position = update.state.position ?? -1;
        this.timestamp = update.state.time;
    }
}

export interface Player {
    /**
     * When the player receives an update from lavalink.
     */
    on(event: "playerUpdate", listener: (update: Lavalink.PlayerUpdate) => any): this;

    once(event: "playerUpdate", listener: (update: Lavalink.PlayerUpdate) => any): this;

    /**
     * Emitted when the player receives a player event.
     */
    on(event: "event", listener: (event: Lavalink.PlayerEvent) => any): this;

    once(event: "event", listener: (event: Lavalink.PlayerEvent) => any): this;

    /**
     * Emitted when the websocket was closed.
     */
    on(event: "closed", listener: (event: Lavalink.WebSocketClosedEvent) => any): this;

    once(event: "closed", listener: (event: Lavalink.WebSocketClosedEvent) => any): this;

    /**
     * Emitted when a track stops.
     */
    on(event: "end", listener: (event: Lavalink.TrackEndEvent) => any): this;

    once(event: "end", listener: (event: Lavalink.TrackEndEvent) => any): this;

    /**
     * Emitted when the player has ran into an exception.
     */
    on(event: "error", listener: (event: Lavalink.TrackExceptionEvent) => any): this;

    once(event: "error", listener: (event: Lavalink.TrackExceptionEvent) => any): this;

    /**
     * Emitted when a player has started a track.
     */
    on(event: "start", listener: (event: Lavalink.TrackStartEvent) => any): this;

    once(event: "start", listener: (event: Lavalink.TrackStartEvent) => any): this;

    /**
     * Emitted when a track is stuck.
     */
    on(event: "stuck", listener: (event: Lavalink.TrackStuckEvent) => any): this;

    once(event: "stuck", listener: (event: Lavalink.TrackStuckEvent) => any): this;
}

export interface PlayOptions {
    /**
     * The number of milliseconds to offset the track by.
     */
    startTime?: number;

    /**
     * The number of milliseconds at which point the track should stop playing
     */
    endTime?: number;

    /**
     * This operation will be ignored if a track is already playing or paused.
     */
    noReplace?: boolean;
}

export interface ConnectOptions {
    /**
     * If you wanna self deafen the bot
     */
    selfDeaf?: boolean;

    /**
     * If you want to self mute the bot.
     */
    selfMute?: boolean;
}
