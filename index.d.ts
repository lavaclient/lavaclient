declare module "lavaclient" {
  import * as Types from "@kyflx-dev/lavalink-types";
  import { EventEmitter } from "events";
  import WebSocket, { ClientOptions } from "ws";

  export class Manager extends EventEmitter {
    /**
     * The client id to use.
     */
    public userId: string;
    /**
     * The method used for sending voice state updates to discord.
     */
    public send: SendFunction;
    /**
     * The number of shards the client is running on.
     */
    public shards: number;
    /**
     * The map of connected* sockets.
     */
    public readonly nodes: Map<string, Socket>;
    /**
     * The map of players.
     */
    public readonly players: Map<string, Player>;
    /**
     * Creates a new Lavaclient Manager.
     * @param nodes - The nodes to use when initalized.
     * @param options - The options to use.
     */
    public constructor(nodes: SocketData[], options: ManagerOptions);
    /**
     * An array of ideal (low cpu usage) nodes.
     */
    public get ideal(): Socket[];
    /**
     * Initiate the manager. Creates all of the sockets.
     * @param userId - The client id to use if not specified in the constructor.
     */
    public init(userId?: string): Promise<void>;
    /**
     * Provide a voice server to lavalink.
     * @param server - The voice server object sent by discord.
     */
    public serverUpdate(server: VoiceServer): boolean;
    /**
     * Provide a voice state to lavalink.
     * @param state - The voice state object sent by discord.
     */
    public stateUpdate(state: VoiceState): void;
    /**
     * Destroy a player and leave the voice channel it's playing in.
     * @param guildId - The guild id of the player you want to destroy.
     */
    public leave(guildId: string): Promise<void>;
    /**
     * Creates a player and joins a voice channel.
     * @param data - The id and guild of the voice channel to join.
     * @param options - Whether you would like to self deafen or mute on join.
     */
    public join(data: PlayerData, options?: ConnectOptions): Promise<Player>;

    /**
     * Registers a plugin for use in the Manager.
     * @param plugin - The plugin to use.
     */
    public static use(plugin: Plugin): typeof Manager;

    public on(event: "error", listener: (error: any, node?: string) => any): this;
    public on(event: "open", listener: (node: string) => any): this;
    public on(event: "close", listener: (node: string, reason: string, code: number) => any): this;
  }

  export class Player extends EventEmitter {
    /**
     * The node that this player is accompanied to.
     */
    public readonly node: Socket;
    /**
     * The manager that this player is accompanied to.
     */
    public readonly manager: Manager;
    /**
     * The guild that this player belongs to.
     */
    public readonly guild: string;
    /**
     * The voice channel that this player belongs to.
     */
    public readonly channel: string;
    /**
     * The player state sent by lavalink.
     */
    public state: Types.PlayerState;
    /**
     * Whether the player is paused or not.
     */
    public paused: boolean;
    /**
     * The currently playing base64 track.
     */
    public track: string;
    /**
     * Whether this player is playing or not.
     */
    public playing: boolean;
    /**
     * The timestamp of when the player started playing the current base64.
     */
    public playingTimestamp: number;
    /**
     * The current player volume.
     */
    public volume: number;
    /**
     * Creates a new player.
     * @param data - The voice channel and guild id that this player belongs to.
     * @param node - The node that accompanies this player.
     */
    public constructor(data: PlayerData, node: Socket);
    /**
     * Play a base64 lavaplayer track.
     * @param track - The base64 track from lavaplayer to play.
     * @param options - Options to pass with the track.
     */
    public play(track: string, options?: PlayOptions): Promise<boolean>;
    /**
     * Stops the current track.
     */
    public stop(): Promise<boolean>;
    /**
     * Pause the current playback.
     */
    public pause(pause?: boolean): Promise<boolean>;
    /**
     * Resume the current playback.
     */
    public resume(): Promise<boolean>;
    /**
     * Seek to a position in the current track.
     * @param position - The position to seek to.
     */
    public seek(position: number): Promise<boolean>;
    /**
     * Set this players volume. Must be 0-1000.
     * @param volume - The volume to set.
     */
    public setVolume(volume: number): Promise<boolean>;
    /**
     * Set this players equalizer.
     * @param bands - The bands to set.
     */
    public equalizer(bands: Types.EqualizerBand[]): Promise<boolean>;
    /**
     * Destroy this player.
     */
    public destroy(): Promise<boolean>;
    /**
     * Send a message to this players accompaning node.
     * @param op - The message op.
     * @param payload - The paylaod to send.
     */
    protected send(op: string, payload?: any): Promise<boolean>;

    public on(event: "playerUpdate", listener: (event: Types.PlayerUpdate) => any): this;
    public on(event: "end", listener: (event: Types.TrackEndEvent) => any): this;
    public on(event: "error", listener: (error: Types.Exception | string) => any): this;
    public on(event: "start", listener: (track: string) => any): this;
    public on(event: "closed", listener: (event: Types.WebSocketClosedEvent) => any): this;
  }

  export class Socket {
    /**
     * The manager that created this socket.
     */
    public readonly manager: Manager;
    /**
     * The id of this socket. Used for load balancing and identifying it.
     */
    public id: string;
    /**
     * The amount of reconnect tries it's on.
     */
    public tries: number;
    /**
     * The node stats sent by the lavalink node.
     */
    public stats: Partial<Types.NodeStats>;
    /**
     * The options passed in the socket data.
     */
    public options: SocketOptions;
    /**
     * The host address of the lavalink node.
     */
    public readonly host: string;
    /**
     * The port the lavalink node is listening on.
     */
    public readonly port: string;
    /**
     * The authentication the lavalink node is accepting.
     */
    public readonly password: string;
    /**
     * The websocket connection.
     */
    protected ws: WebSocket;
    /**
     * An array of waiting payloads that will be flushed when the socket is connected.
     */
    protected waiting: WaitingPayload[];
    /**
     * Creates a new Socket.
     * @param data - Socket Data that's used for connecting and configuring the connection.
     * @param manager - The manager that created this socket.
     */
    public constructor(data: SocketData, manager: Manager);
    /**
     * Whether this socket is connected to the lavalink node or not.
     */
    public get connected(): boolean;
    /**
     * Sends a payload to lavalink
     * @param data - The payload that will be sent to the lavalink node.
     */
    public send(data: Record<string, any>): Promise<boolean>;
    /**
     * Configures player resuming.
     * @param key - The resume key.
     */
    public configureResuming(key?: string): Promise<boolean>;
    /**
     * Connect to the lavalink node.
     * @param userId - The client id for use in the headers.
     */
    public connect(userId: string): Promise<void>;
    /**
     * Flush all of the payloads that were waiting to be sent.
     */
    protected flush(): Promise<void>
  }

  export abstract class Plugin {
    public manager: Manager;
    /**
     * This is ran whenever it's passed into Manager#use()
     */
    public preRegister(): any;
    public register(manager: Manager): any;
  }

  /** Types & Interfaces */
  export type SendFunction = (guildId: string, payload: any) => any;
  export type PlayOptions = Partial<Omit<PlayTrack, "op" | "guildId" | "track">>;

  export interface ManagerOptions {
    send: SendFunction;
    shards?: number;
    userId?: string;
    socketDefaults?: SocketOptions;
  }

  export interface SocketData {
    host: string;
    port: string | number;
    password: string;
    id: string;
    options?: SocketOptions;
  }

  export interface SocketOptions {
    retryDelay?: number;
    maxTries?: number;
    resumeKey?: string;
    resumeTimeout?: number;
  }

  export interface WaitingPayload {
    res: (v: any) => any;
    rej: (error: Error) => any;
    payload: Record<string, any>;
  }

  export interface VoiceServer {
    token: string;
    guild_id: string;
    endpoint: string;
  }

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

  export interface PlayerData {
    guild: string;
    channel: string;
    node?: string;
  }

  export interface ConnectOptions {
    deaf?: boolean;
    mute?: boolean;
  }

  /** Extension Stuff */
  export interface Extendables {
    socket: typeof Socket;
    player: typeof Player;
  }

  export function Extend<K extends keyof Extendables>(name: K): <T extends Extendables[K]>(target: T) => T;

  export declare class Structures {
    static extend<K extends keyof Extendables, E extends Extendables[K]>(name: K, extender: (base: Extendables[K]) => E): E;
    static get<K extends keyof Extendables>(name: K): Extendables[K];
  }
}
