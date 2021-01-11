import type { EventEmitter } from "events";
import type Lavalink from "@lavaclient/types";
import type WebSocket from "ws";

export class Structures {
  /**
   * Extend the specified structure.
   * @param name The structure to extend.
   * @param extend The extender function.
   * @since 2.0.0
   */
  static extend<K extends keyof Classes, E extends Classes[K]>(name: K, extend: (base: Classes[K]) => E): E;

  /**
   * Get the specified structure.
   * @param name The structure to get.
   * @since 2.0.0
   */
  static get<K extends keyof Classes>(name: K): Classes[K];
}

export interface Classes {
  socket: typeof Socket;
  player: typeof Player;
  filters: typeof Filters;
}

export class Manager extends EventEmitter {
  /**
   * A map of connected sockets.
   */
  readonly sockets: Map<string, Socket>;
  /**
   * A map of connected players.
   */
  readonly players: Map<string, Player>;
  /**
   * The options this manager was created with.
   */
  options: Required<ManagerOptions>;
  /**
   * The client's user id.
   */
  userId: string | undefined;
  /**
   * A send method for sending voice state updates to discord.
   */
  send: Send;
  /**
   * Resume options.
   */
  resuming: ResumeOptions;

  /**
   * @param nodes An array of sockets to connect to.
   * @param options
   */
  constructor(nodes: SocketData[], options: ManagerOptions);

  /**
   * Ideal nodes to use.
   */
  get ideal(): Socket[];

  /**
   * Initializes this manager. Connects all provided sockets.
   * @param userId The client user id.
   * @since 1.0.0
   */
  init(userId?: string): void;

  /**
   * Register a plugin for use.
   * @param plugin
   * @since 2.x.x
   */
  use(plugin: Plugin): Manager;

  /**
   * Used for providing voice server updates to lavalink.
   * @param update The voice server update sent by Discord.
   * @since 1.0.0
   */
  serverUpdate(update: DiscordVoiceServer): Promise<void>;

  /**
   * Used for providing voice state updates to lavalink
   * @param update The voice state update sent by Discord.
   * @since 1.0.0
   */
  stateUpdate(update: DiscordVoiceState): Promise<void>;

  /**
   * Create a player.
   * @param guild The guild this player is for.
   * @param socket The socket to use.
   * @since 2.1.0
   */
  create(guild: string | Dictionary, socket?: Socket): Player;

  /**
   * Destroys a player and leaves the connected voice channel.
   * @param guild The guild id of the player to destroy.
   * @since 2.1.0
   */
  destroy(guild: string | Dictionary): Promise<boolean>;

  /**
   * Search lavalink for songs.
   * @param query The search query.
   */
  search(query: string): Promise<Lavalink.LoadTracksResponse>;
}

export type Send = (guildId: string, payload: any) => any;
export type Dictionary<V = any> = Record<string, V>;

export interface Manager {
  /**
   * Emitted when a lavalink socket is ready.
   */
  on(event: "socketReady", listener: (socket: Socket) => any): this;

  /**
   * Emitted when a lavalink socket has ran into an error.
   */
  on(event: "socketError", listener: (error: any, socket: Socket) => any): this;

  /**
   * Emitted when a lavalink socket has been closed.
   */
  on(event: "socketClose", listener: (event: WebSocket.CloseEvent, socket: Socket) => any): this;

  /**
   * Emitted when a lavalink socket has ran out of reconnect tries.
   */
  on(event: "socketDisconnect", listener: (socket: Socket) => any): this;
}

export interface ManagerOptions {
  /**
   * A method used for sending discord voice updates.
   */
  send: Send;
  /**
   * The number of shards the client has.
   */
  shards?: number;
  /**
   * The user id of the bot (not-recommended, provide it in Manager#init)
   */
  userId?: string;
  /**
   * An array of plugins you want to use.
   */
  plugins?: Plugin[];
  /**
   * If you want to enable resuming.
   */
  resuming?: ResumeOptions | boolean;
  /**
   * Options for reconnection.
   */
  reconnect?: ReconnectOptions;
}

export interface ReconnectOptions {
  /**
   * The total amount of reconnect tries
   */
  maxTries?: number;
  /**
   * Whether or not reconnection's are automatically done.
   */
  auto?: boolean;
  /**
   * The delay between socket reconnection's.
   */
  delay?: number;
}

export interface ResumeOptions {
  /**
   * The resume timeout.
   */
  timeout?: number;
  /**
   * The resume key to use. If omitted a random one will be assigned.
   */
  key?: string;
}

/**
 * @internal
 */
export interface DiscordVoiceServer {
  token: string;
  guild_id: string;
  endpoint: string;
}

/**
 * @internal
 */
export interface DiscordVoiceState {
  channel_id?: string;
  guild_id: string;
  user_id: string;
  session_id: string;
}

export class Player extends EventEmitter {
  /**
   * The id of the guild this player belongs to.
   */
  readonly guild: string;
  /**
   * The socket this player belongs to.
   */
  socket: Socket;
  /**
   * The id of the voice channel this player is connected to.
   */
  channel: string | undefined;
  /**
   * Whether this player is paused or not.
   */
  paused: boolean;
  /**
   * The current playing track.
   */
  track: string | undefined;
  /**
   * Whether this player is playing or not.
   */
  playing: boolean;
  /**
   * The unix timestamp in which this player started playing.
   */
  timestamp: number | undefined;
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
   * @param socket The socket this player belongs to.
   * @param guild The guild that this player is for.
   */
  constructor(socket: Socket, guild: string);

  /**
   * The filters instance
   * @since 3.2.0
   */
  get filters(): Filters;

  /**
   * The head manager of everything.
   * @since 2.1.0
   */
  get manager(): Manager;

  /**
   * Connects to the specified voice channel.
   * @param channel A channel id or object.
   * @param options Options for self mute, self deaf, or force connecting.
   * @since 2.1.x
   */
  connect(channel: string | null | Record<string, any>, options?: ConnectOptions): this;

  /**
   * Disconnect from the voice channel.
   * @since 2.1.x
   */
  disconnect(): this;

  /**
   * Moves this player to another socket.
   * @param socket The socket to move to.
   * @since 3.0.14
   */
  move(socket: Socket): Promise<Player>;

  /**
   * Plays the specified base64 track.
   * @param track The track to play.
   * @param options Play options to send along with the track.
   * @since 1.x.x
   */
  play(track: string | Lavalink.Track, options?: PlayOptions): this;

  /**
   * Change the volume of the player. You can omit the volume param to reset back to 100
   * @param volume May range from 0 to 1000, defaults to 100
   */
  setVolume(volume?: number): this;

  /**
   * Change the paused state of this player. `true` to pause, `false` to resume.
   * @param state Pause state, defaults to true.
   * @since 1.x.x
   */
  pause(state?: boolean): this;

  /**
   * Resumes the player, if paused.
   * @since 1.x.x
   */
  resume(): this;

  /**
   * Stops the current playing track.
   * @since 1.x.x
   */
  stop(): this;

  /**
   * Seek to a position in the current song.
   * @param position The position to seek to in milliseconds.
   */
  seek(position: number): this;

  /**
   * Sets the equalizer of this player.
   * @param bands Equalizer bands to use.
   * @since 2.1.x
   *
   * @deprecated Please use Filters#equalizer and Filters#apply
   */
  setEqualizer(bands: Lavalink.EqualizerBand[]): this;

  /**
   * Destroy this player.
   * @param disconnect Disconnect from the voice channel.
   * @since 1.x.x
   */
  destroy(disconnect?: boolean): this;

  /**
   * Provide a voice update from discord.
   * @since 1.x.x
   * @private
   */
  handleVoiceUpdate(update: DiscordVoiceState | DiscordVoiceServer): Promise<this>;

  /**
   * Send data to lavalink as this player.
   * @param op The operation.
   * @param data The data.
   * @param priority Whether or not this is a prioritized operation.
   * @since 1.0.0
   */
  send(op: string, data?: Dictionary, priority?: boolean): this;
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
  on(event: "event", listener: (event: Lavalink.Event) => any): this;

  once(event: "event", listener: (event: Lavalink.Event) => any): this;

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

export enum Status {
  CONNECTED = 0,
  CONNECTING = 1,
  IDLE = 2,
  DISCONNECTED = 3,
  RECONNECTING = 4
}

export class Socket {
  /**
   * The manager instance.
   */
  readonly manager: Manager;
  /**
   * This lavalink nodes identifier.
   */
  readonly id: string;
  /**
   * Number of remaining reconnect tries.
   */
  remainingTries: number;
  /**
   * The status of this lavalink node.
   */
  status: Status;
  /**
   * Hostname of the lavalink node.
   */
  host: string;
  /**
   * Port of the lavalink node.
   */
  port?: number;
  /**
   * Password of the lavalink node.
   */
  password: string;
  /**
   * The performance stats of this player.
   */
  stats: Lavalink.NodeStats;
  /**
   * The resume key.
   */
  resumeKey?: string;
  /**
   * Whether or not this lavalink node uses an ssl.
   */
  secure: boolean;

  /**
   * @param manager
   * @param data
   */
  constructor(manager: Manager, data: SocketData);

  /**
   * The reconnection options
   */
  get reconnection(): ReconnectOptions;

  /**
   * If this node is connected or not.
   */
  get connected(): boolean;

  /**
   * The address of this lavalink node.
   */
  get address(): string;

  /**
   * Get the total penalty count for this node.
   */
  get penalties(): number;

  /**
   * Send a message to lavalink.
   * @param data The message data.
   * @param priority If this message should be prioritized.
   * @since 1.0.0
   */
  send(data: unknown, priority?: boolean): void;

  /**
   * Connects to the lavalink node.
   * @since 1.0.0
   */
  connect(): void;

  /**
   * Reconnect to the lavalink node.
   */
  reconnect(): void;
}

export interface SocketData {
  /**
   * The ID of this lavalink node.
   */
  id: string;
  /**
   * The host of this lavalink node.
   */
  host: string;
  /**
   * Whether or not this node is secured via ssl.
   */
  secure?: boolean;
  /**
   * The port of this lavalink node.
   */
  port?: number;
  /**
   * The password of this lavalink node.
   */
  password?: string;
}

export abstract class Plugin {
  /**
   * The manager that loaded this plugin.
   */
  manager: Manager;

  /**
   * Called when this plugin is loaded.
   * @param manager The manager that loaded this plugin.
   * @since 3.0.0
   */
  load(manager: Manager): void;

  /**
   * Called when the manager is initialized.
   * @since 3.0.0
   */
  init(): void;
}

export class Filters implements Lavalink.FilterMap {
  /**
   * The default volume configuration
   */
  static DEFAULT_VOLUME: Lavalink.VolumeFilter;

  /**
   * The default configuration for timescale..
   */
  static DEFAULT_TIMESCALE: Lavalink.TimescaleFilter;

  /**
   * The default karaoke configuration.
   */
  static DEFAULT_KARAOKE: Lavalink.KaraokeFilter;

  /**
   * The default tremolo configuration.
   */
  static DEFAULT_TREMOLO: Lavalink.TremoloFilter;

  /**
   * The player this filters instance is for..
   */
  readonly player: Player;

  /**
   * The timescale filter.
   * @private
   */
  timescale?: Lavalink.TimescaleFilter | null;

  /**
   * The karaoke filter.
   * @private
   */
  karaoke?: Lavalink.KaraokeFilter | null;

  /**
   * The equalizer filter.
   * @private
   */
  equalizer: Lavalink.EqualizerFilter;

  /**
   * The volume filter.
   * @private
   */
  volume: Lavalink.VolumeFilter;

  /**
   * The tremolo filter.
   */
  tremolo: Lavalink.TremoloFilter | null;

  /**
   * @param player The player instance.
   */
  constructor(player: Player);

  /**
   * Whether the equalizer filter is enabled.
   * Checks if any of the provided bans doesn't have a gain of 0.0, 0.0 being the default gain.
   */
  get isEqualizerEnabled(): boolean;

  /**
   * Whether the tremolo filter is enabled or not.
   * Checks if it's null or the depth does not equal 0.0.
   */
  get isTremoloEnabled(): boolean;

  /**
   * Whether the karaoke filter is enabled or not.
   * Checks if the karaoke property does not equal null.
   */
  get isKaraokeEnabled(): boolean;

  /**
   * Whether the timescale filter is enabled.
   * Checks if the property does not equal and if any of it's properties doesn't equal 1.0
   */
  get isTimescaleEnabled(): boolean;

  /**
   * The filters payload.
   */
  get payload(): Lavalink.FilterMap;

  /**
   * Applies the filters to the player.
   * @param prioritize Whether to prioritize the payload.
   */
  apply(prioritize?: boolean): this;
}

