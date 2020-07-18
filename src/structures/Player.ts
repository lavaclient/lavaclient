import { EventEmitter } from "events";

import type Lavalink from "@lavaclient/types";
import type { Socket } from "./Socket";
import type { Manager, ObjectLiteral, VoiceServer, VoiceState } from "./Manager";

export class Player extends EventEmitter {
  /**
   * The socket this player belongs to.
   */
  public readonly socket: Socket;
  /**
   * The id of the guild this player belongs to.
   */
  public readonly guild: string;
  /**
   * The id of the voice channel this player is connected to.
   */
  public channel: string | undefined;
  /**
   * Whether this player is paused or not.
   */
  public paused: boolean;
  /**
   * The current playing track.
   */
  public track: string | undefined;
  /**
   * Whether this player is playing or not.
   */
  public playing: boolean;
  /**
   * The unix timestamp in which this player started playing.
   */
  public timestamp: number | undefined;
  /**
   * Track position in milliseconds.
   */
  public position: number;
  /**
   * The current volume of this player.
   */
  public volume: number;
  /**
   * Equalizer bands this player is using.
   */
  public equalizer: Lavalink.EqualizerBand[];
  /**
   * If this player is connected to a voice channel.
   */
  public connected: boolean;

  /**
   * The voice state for this player.
   * @internal
   */
  private _state: VoiceState | undefined;
  /**
   * The voice server for this player.
   * @internal
   */
  private _server: VoiceServer | undefined;

  /**
   * @param socket The socket this player belongs to.
   * @param guild The guild that this player is for.
   */
  public constructor(socket: Socket, guild: string) {
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
   * The head manager of everything.
   * @since 2.1.0
   */
  public get manager(): Manager {
    return this.socket.manager;
  }

  /**
   * Connects to the specified voice channel.
   * @param channel A channel id or object.
   * @param options Options for self mute, self deaf, or force connecting.
   * @since 2.1.x
   */
  public async connect(channel: string | Record<string, any>, options: ConnectOptions = {}): Promise<Player> {
    if (this.connected && !options.force)
      throw new Error(`Player#connect (${this.guild}): Already Connected. You can append the force option but this isn't recommended.`);

    const channelId = typeof channel === "object" ? channel.id : channel;
    await this.socket.manager.send(this.guild, {
      op: 4,
      d: {
        guild_id: this.guild,
        channel_id: channelId,
        self_deaf: options.selfDeaf ?? false,
        self_mute: options.selfMute ?? false
      }
    });

    this.channel = channelId;
    this.connected = true;
    return this;
  }

  /**
   * Disconnect from the voice channel.
   * @param remove Whether to remove the player from the manager.
   * @since 2.1.x
   */
  public async disconnect(remove = false): Promise<this> {
    if (remove)
      this.manager.players.delete(this.guild);

    await this.socket.manager.send(this.guild, {
      op: 4,
      d: {
        guild_id: this.guild,
        channel_id: null,
        self_deaf: null,
        self_mute: null
      }
    });

    return this;
  }

  /**
   * Plays the specified base64 track.
   * @param track The track to play.
   * @param options Play options to send along with the track.
   * @since 1.x.x
   */
  public play(track: string | Lavalink.Track, options: PlayOptions = {}): Promise<void> {
    return this.send("play", Object.assign({
      track: typeof track === "object" ? track.track : track
    }, options))
  }

  /**
   * Change the volume of the player. You can omit the volume param to reset back to 100
   * @param volume May range from 0 to 1000, defaults to 100
   */
  public setVolume(volume: number = 100): Promise<void> {
    if (volume < 0 || volume > 1000)
      throw new RangeError(`Player#setVolume (${this.guild}): Volume must be within the 0 to 1000 range.`);

    this.volume = volume;

    return this.send("volume", { volume })
  }

  /**
   * Change the paused state of this player. `true` to pause, `false` to resume.
   * @param state Pause state, defaults to true.
   * @since 1.x.x
   */
  public pause(state = true): Promise<void> {
    this.paused = state;
    this.playing = !state;
    return this.send("pause", { pause: state });
  }

  /**
   * Resumes the player, if paused.
   * @since 1.x.x
   */
  public resume(): Promise<void> {
    return this.pause(false);
  }

  /**
   * Stops the current playing track.
   * @since 1.x.x
   */
  public stop(): Promise<void> {
    delete this.track;
    delete this.timestamp;
    this.position = 0;

    return this.send("stop");
  }

  /**
   * Seek to a position in the current song.
   * @param position The position to seek to in milliseconds.
   */
  public seek(position: number): Promise<void> {
    if (!this.track) throw new Error(`Player#seek() ${this.guild}: Not playing anything.`);
    return this.send("seek", { position });
  }

  /**
   * Sets the equalizer of this player.
   * @param bands Equalizer bands to use.
   * @since 2.1.x
   */
  public setEqualizer(bands: Lavalink.EqualizerBand[]): Promise<void> {
    this.equalizer = bands ?? [];
    return this.send("equalizer", { bands });
  }

  /**
   * Destroy this player.
   * @param disconnect Disconnect from the voice channel.
   * @since 1.x.x
   */
  public async destroy(disconnect = false): Promise<void> {
    if (disconnect) await this.disconnect();
    return this.send("destroy");
  }

  /**
   * Provide a voice update from discord.
   * @param update
   * @since 1.x.x
   * @private
   */
  public provide(update: VoiceState | VoiceServer): this {
    if ("token" in update) this._server = update;
    else this._state = update;
    return this;
  }

  /**
   * Send a voice update to lavalink.
   * @since 2.1.x
   * @internal
   */
  public async voiceUpdate(): Promise<void> {
    if (!this._server || !this._state) return;

    await this.send("voiceUpdate", {
      sessionId: this._state.session_id,
      event: this._server,
    });

    delete this._state;
    delete this._server;
  }

  /**
   * Send data to lavalink as this player.
   * @param op
   * @param data
   * @since 1.0.0
   */
  public send(op: string, data: ObjectLiteral = {}): Promise<void> {
    data = { op, guildId: this.guild, ...data }
    this.emit(`raw`, op, data)
    return this.socket.send(data);
  }

  /**
   * @private
   */
  private _event(event: Lavalink.Event): void {
    switch (event.type) {
      case "TrackEndEvent":
        if (event.reason !== "REPLACED") this.playing = false;
        delete this.timestamp;
        delete this.track;
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
        this.stop().then(() => this.emit("stuck", event));
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
    if (!update.state) return;
    this.position = update.state.position;
    this.timestamp = update.state.time;
  }
}

export interface Player {
  /**
   * Emitted whenever the player sends a payload.
   */
  on(event: "raw", listener: (op: string, data: ObjectLiteral) => any): this;

  /**
   * When the player receives an update from lavalink.
   */
  on(event: "playerUpdate", listener: (update: Lavalink.PlayerUpdate) => any): this;

  /**
   * Emitted when the player receives a player event.
   */
  on(event: "event", listener: (event: Lavalink.Event) => any): this;

  /**
   * Emitted when the websocket was closed.
   */
  on(event: "closed", listener: (event: Lavalink.WebSocketClosedEvent) => any): this;

  /**
   * Emitted when a track stops.
   */
  on(event: "end", listener: (event: Lavalink.TrackEndEvent) => any): this;

  /**
   * Emitted when the player has ran into an exception.
   */
  on(event: "error", listener: (event: Lavalink.TrackExceptionEvent) => any): this;

  /**
   * Emitted when a player has started a track.
   */
  on(event: "start", listener: (event: Lavalink.TrackStartEvent) => any): this;

  /**
   * Emitted when a track is stuck.
   */
  on(event: "stuck", listener: (event: Lavalink.TrackStuckEvent) => any): this;
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
   * If you wanna self deafen the bot.
   */
  selfDeaf?: boolean;
  /**
   * If you want to self mute the bot.
   */
  selfMute?: boolean;
  /**
   * Whether to force connect the bot.
   */
  force?: boolean;
}
