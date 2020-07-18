import type { EventEmitter } from "events";
import type WebSocket from "ws";
import type Lavalink, { LoadTracksResponse, NodeStats } from "@lavaclient/types";

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
  options: ManagerOptions;
  /**
   * The client's user id.
   */
  userId: string | undefined;
  /**
   * A send method for sending voice state updates to discord.
   */
  send: Send;
  /**
   * The number of shards the client is running on.
   */
  shards: number;
  /**
   * If resuming is enabled.
   */
  resuming: boolean;

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
  serverUpdate(update: VoiceServer): Promise<void>;

  /**
   * Used for providing voice state updates to lavalink
   * @param update The voice state update sent by Discord.
   * @since 1.0.0
   */
  stateUpdate(update: VoiceState): Promise<void>;

  /**
   * Create a player.
   * @param guild The guild this player is for.
   * @since 2.1.0
   */
  create(guild: string | ObjectLiteral): Player;

  /**
   * Destroys a player and leaves the connected voice channel.
   * @param guild The guild id of the player to destroy.
   * @since 2.1.0
   */
  destroy(guild: string | ObjectLiteral): Promise<boolean>;

  /**
   * Search lavalink for songs.
   * @param query The search query.
   */
  search(query: string): Promise<LoadTracksResponse>;
}

export interface Manager {
  /**
   * Emitted when a lavalink socket is ready.
   */
  on(event: "socketReady", listener: (socket: Socket) => any): this;

  /**
   * Emitted when a lavalink socket has ran into an error.
   */
  on(event: "socketError", listener: (socket: Socket, error: any) => any): this;

  /**
   * Emitted when a lavalink socket has been closed.
   */
  on(event: "socketClose", listener: (socket: Socket, event: WebSocket.CloseEvent) => any): this;

  /**
   * Emitted when a lavalink socket has ran out of reconnect tries.
   */
  on(event: "socketDisconnect", listener: (socket: Socket) => any): this;
}

export class Player extends EventEmitter {
  /**
   * The socket this player belongs to.
   */
  readonly socket: Socket;
  /**
   * The id of the guild this player belongs to.
   */
  readonly guild: string;
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
  connect(channel: string | Record<string, any>, options?: ConnectOptions): Promise<Player>;

  /**
   * Disconnect from the voice channel.
   * @param remove Whether to remove the player from the manager.
   * @since 2.1.x
   */
  disconnect(remove?: boolean): Promise<this>;

  /**
   * Plays the specified base64 track.
   * @param track The track to play.
   * @param options Play options to send along with the track.
   * @since 1.x.x
   */
  play(track: string | Lavalink.Track, options?: PlayOptions): Promise<void>;

  /**
   * Change the volume of the player. You can omit the volume param to reset back to 100
   * @param volume May range from 0 to 1000, defaults to 100
   */
  setVolume(volume?: number): Promise<void>;

  /**
   * Change the paused state of this player. `true` to pause, `false` to resume.
   * @param state Pause state, defaults to true.
   * @since 1.x.x
   */
  pause(state?: boolean): Promise<void>;

  /**
   * Resumes the player, if paused.
   * @since 1.x.x
   */
  resume(): Promise<void>;

  /**
   * Stops the current playing track.
   * @since 1.x.x
   */
  stop(): Promise<void>;

  /**
   * Seek to a position in the current song.
   * @param position The position to seek to in milliseconds.
   */
  seek(position: number): Promise<void>;

  /**
   * Sets the equalizer of this player.
   * @param bands Equalizer bands to use.
   * @since 2.1.x
   */
  setEqualizer(bands: Lavalink.EqualizerBand[]): Promise<void>;

  /**
   * Destroy this player.
   * @param disconnect Disconnect from the voice channel.
   * @since 1.x.x
   */
  destroy(disconnect?: boolean): Promise<void>;

  /**
   * Provide a voice update from discord.
   * @param update
   * @since 1.x.x
   * @private
   */
  provide(update: VoiceState | VoiceServer): this;

  /**
   * Send a voice update to lavalink.
   * @since 2.1.x
   * @internal
   */
  voiceUpdate(): Promise<void>;

  /**
   * Send data to lavalink as this player.
   * @param op
   * @param data
   * @since 1.0.0
   */
  send(op: string, data?: ObjectLiteral): Promise<void>;
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

export class Socket {
  /**
   * The manager this socket belongs to.
   */
  readonly manager: Manager;
  /**
   * This sockets identifier.
   */
  readonly id: string;
  /**
   * The host of the lavalink node we're connecting to.
   */
  readonly host: string;
  /**
   * The port of the lavalink node we're connecting to.
   */
  readonly port: string;
  /**
   * The authorization being used when connecting.
   */
  readonly password: string;
  /**
   * Total remaining tries this socket has for reconnecting
   */
  remaining: number;
  /**
   * The resume key being used for resuming.
   */
  resumeKey?: string;
  /**
   * The stats sent by lavalink.
   */
  stats: NodeStats;
  /**
   * The options this socket is using.
   */
  options: SocketOptions;
  /**
   * The websocket instance for this socket.
   */
  protected ws?: WebSocket;
  /**
   * The queue for sendables.
   */
  protected queue: Sendable[];

  /**
   * @param manager The manager this socket belongs to.
   * @param data Data to use.
   */
  constructor(manager: Manager, data: SocketData);

  /**
   * Whether this socket is connected or not.
   */
  get connected(): boolean;

  /**
   * Get the total penalty count for this node.
   */
  get penalties(): number;

  /**
   * Get the string representation of this socket.
   * @since 3.0.0
   */
  toString(): string;

  /**
   * Send data to the websocket.
   * @param data Data to send. - JSON
   * @since 1.0.0
   */
  send(data: any): Promise<void>;

  /**
   * Configure Lavalink Resuming.
   * @param key The resume key.
   * @since 1.0.0
   */
  configureResuming(key?: string | undefined): Promise<void>;

  /**
   * Connects to the WebSocket.
   * @since 1.0.0
   */
  connect(): this;

  /**
   * Flushes out the send queue.
   * @since 1.0.0
   */
  protected checkQueue(): Promise<void>;
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

export type Send = (guildId: string, payload: any) => any;

export type ObjectLiteral = Record<string, any>;

/**
 * @internal
 */
export interface Sendable {
  res: (...args: any[]) => any;
  rej: (...args: any[]) => any;
  data: string;
}

export interface SocketOptions {
  /**
   * The delay in between reconnects.
   */
  retryDelay?: number;
  /**
   * The amount of tries to use when reconnecting.
   */
  maxTries?: number;
  /**
   * The resume key to use.
   */
  resumeKey?: string;
  /**
   * The resume timeout to use.
   */
  resumeTimeout?: number;
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

/**
 * @internal
 */
export interface VoiceServer {
  token: string;
  guild_id: string;
  endpoint: string;
}

/**
 * @internal
 */
export interface VoiceState {
  channel_id?: string;
  guild_id: string;
  user_id: string;
  session_id: string;
  deaf?: boolean;
  mute?: boolean;
  self_deaf?: boolean;
  self_mute?: boolean;
  suppress?: boolean;
}

export interface Classes {
  socket: typeof Socket;
  player: typeof Player;
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
   * Default socket options to use.
   */
  defaultSocketOptions?: SocketOptions;
  /**
   * An array of plugins you want to use.
   */
  plugins?: Plugin[];
  /**
   * If you want to enable resuming.
   */
  resuming?: boolean;
}

export interface SocketData {
  /**
   * The identifier of your lavalink node.
   */
  id: string;
  /**
   * The hostname of your lavalink node.
   */
  host?: string;
  /**
   * The port of your lavalink node.
   */
  port?: string | number;
  /**
   * The password of your lavalink node.
   */
  password?: string;
  /**
   * Additional socket options.
   */
  options?: SocketOptions;
}
