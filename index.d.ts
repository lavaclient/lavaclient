import { EventEmitter } from "events";
import type Lavalink from "@lavaclient/types";
import type WebSocket from "ws";

export class Structures {
  static extend<K extends keyof Classes, E extends Classes[K]>(
    name: K,
    extend: (base: Classes[K]) => E
  ): E;
  static get<K extends keyof Classes>(name: K): Classes[K];
}
export interface Classes {
  socket: typeof Socket;
  player: typeof Player;
  filters: typeof Filters;
}

export class Manager extends EventEmitter {
  readonly sockets: Map<string, Socket>;
  readonly players: Map<string, Player>;
  options: Required<ManagerOptions>;
  userId: string | undefined;
  send: Send;
  resuming: ResumeOptions;
  constructor(nodes: SocketData[], options: ManagerOptions);
  get ideal(): Socket[];
  init(userId?: string): void;
  use(plugin: Plugin): Manager;
  serverUpdate(update: DiscordVoiceServer): Promise<void>;
  stateUpdate(update: DiscordVoiceState): Promise<void>;
  create(guild: string | Dictionary, socket?: Socket): Player;
  destroy(guild: string | Dictionary): Promise<boolean>;
  search(query: string): Promise<Lavalink.LoadTracksResponse>;
}
export type Send = (guildId: string, payload: any) => any;
export type Dictionary<V = any> = Record<string, V>;
export interface Manager {
  on(event: "socketReady", listener: (socket: Socket) => any): this;
  on(event: "socketError", listener: (error: any, socket: Socket) => any): this;
  on(
    event: "socketClose",
    listener: (event: WebSocket.CloseEvent, socket: Socket) => any
  ): this;
  on(event: "socketDisconnect", listener: (socket: Socket) => any): this;
}
export interface ManagerOptions {
  send: Send;
  shards?: number;
  userId?: string;
  plugins?: Plugin[];
  resuming?: ResumeOptions | boolean;
  reconnect?: ReconnectOptions;
}
export interface ReconnectOptions {
  maxTries?: number;
  auto?: boolean;
  delay?: number;
}
export interface ResumeOptions {
  timeout?: number;
  key?: string;
}
export interface DiscordVoiceServer {
  token: string;
  guild_id: string;
  endpoint: string;
}
export interface DiscordVoiceState {
  channel_id?: string;
  guild_id: string;
  user_id: string;
  session_id: string;
}

export class Player extends EventEmitter {
  #private;
  readonly guild: string;
  socket: Socket;
  channel: string | undefined;
  paused: boolean;
  track: string | undefined;
  playing: boolean;
  timestamp: number | undefined;
  position: number;
  volume: number;
  equalizer: Lavalink.EqualizerBand[];
  connected: boolean;
  constructor(socket: Socket, guild: string);
  get filters(): Filters;
  get manager(): Manager;
  connect(
    channel: string | null | Record<string, any>,
    options?: ConnectOptions
  ): this;
  disconnect(): this;
  move(socket: Socket): Promise<Player>;
  play(track: string | Lavalink.Track, options?: PlayOptions): this;
  setVolume(volume?: number): this;
  pause(state?: boolean): this;
  resume(): this;
  stop(): this;
  seek(position: number): this;
  setEqualizer(bands: Lavalink.EqualizerBand[], asFilter?: Boolean): this;
  destroy(disconnect?: boolean): this;
  handleVoiceUpdate(
    update: DiscordVoiceState | DiscordVoiceServer
  ): Promise<this>;
  send(op: Lavalink.OpCode, data?: Dictionary, priority?: boolean): this;
}
export interface Player {
  on(
    event: "playerUpdate",
    listener: (update: Lavalink.PlayerUpdate) => any
  ): this;
  once(
    event: "playerUpdate",
    listener: (update: Lavalink.PlayerUpdate) => any
  ): this;
  on(event: "event", listener: (event: Lavalink.PlayerEvent) => any): this;
  once(event: "event", listener: (event: Lavalink.PlayerEvent) => any): this;
  on(
    event: "closed",
    listener: (event: Lavalink.WebSocketClosedEvent) => any
  ): this;
  once(
    event: "closed",
    listener: (event: Lavalink.WebSocketClosedEvent) => any
  ): this;
  on(event: "end", listener: (event: Lavalink.TrackEndEvent) => any): this;
  once(event: "end", listener: (event: Lavalink.TrackEndEvent) => any): this;
  on(
    event: "error",
    listener: (event: Lavalink.TrackExceptionEvent) => any
  ): this;
  once(
    event: "error",
    listener: (event: Lavalink.TrackExceptionEvent) => any
  ): this;
  on(event: "start", listener: (event: Lavalink.TrackStartEvent) => any): this;
  once(
    event: "start",
    listener: (event: Lavalink.TrackStartEvent) => any
  ): this;
  on(event: "stuck", listener: (event: Lavalink.TrackStuckEvent) => any): this;
  once(
    event: "stuck",
    listener: (event: Lavalink.TrackStuckEvent) => any
  ): this;
}
export interface PlayOptions {
  startTime?: number;
  endTime?: number;
  noReplace?: boolean;
}
export interface ConnectOptions {
  selfDeaf?: boolean;
  selfMute?: boolean;
}

export enum Status {
  CONNECTED = 0,
  CONNECTING = 1,
  IDLE = 2,
  DISCONNECTED = 3,
  RECONNECTING = 4,
}
export class Socket {
  readonly manager: Manager;
  readonly id: string;
  remainingTries: number;
  status: Status;
  host: string;
  port?: number;
  password: string;
  stats: Lavalink.StatsData;
  resumeKey?: string;
  secure: boolean;
  constructor(manager: Manager, data: SocketData);
  get reconnection(): ReconnectOptions;
  get connected(): boolean;
  get address(): string;
  get penalties(): number;
  send(data: Lavalink.OutgoingMessage, priority?: boolean): void;
  connect(): void;
  reconnect(): void;
}
export interface SocketData {
  id: string;
  host: string;
  secure?: boolean;
  port?: number;
  password?: string;
}

export abstract class Plugin {
  manager: Manager;
  load(manager: Manager): void;
  init(): void;
}

export class Filters {
  static DEFAULT_VOLUME: Lavalink.VolumeFilter;
  static DEFAULT_TIMESCALE: Lavalink.TimescaleFilter;
  static DEFAULT_KARAOKE: Lavalink.KaraokeFilter;
  static DEFAULT_TREMOLO: Lavalink.TremoloFilter;
  readonly player: Player;
  timescale?: Lavalink.TimescaleFilter;
  karaoke?: Lavalink.KaraokeFilter;
  equalizer: Lavalink.EqualizerFilter;
  distortion?: Lavalink.DistortionFilter;
  volume: Lavalink.VolumeFilter;
  tremolo?: Lavalink.TremoloFilter;
  rotation?: Lavalink.RotationFilter;
  vibrato?: Lavalink.VibratoFilter;
  constructor(player: Player);
  get isRotationEnabled(): boolean;
  get isDistortionEnabled(): boolean;
  get isEqualizerEnabled(): boolean;
  get isTremoloEnabled(): boolean;
  get isKaraokeEnabled(): boolean;
  get isTimescaleEnabled(): boolean;
  get payload(): Partial<Lavalink.FilterData>;
  apply(prioritize?: boolean): this;
}
