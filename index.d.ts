import type { EventBus, ListenerMap } from "@dimensional-fun/common";
import type * as Lavalink from "@lavaclient/types";
import type phin from "phin";

export class Player<N extends Node = Node> extends EventBus<PlayerEvents> {
    readonly node: N;
    static USE_FILTERS: boolean;
    readonly guildId: Snowflake;
    channelId: string | null;
    track?: string;
    playing: boolean;
    playingSince?: number;
    paused: boolean;
    position?: number;
    connected: boolean;
    filters: Partial<Lavalink.FilterData>;
    constructor(node: N, guild: Snowflake | DiscordResource);
    get volume(): number;
    connect(channel: Snowflake | DiscordResource | null, options?: ConnectOptions): this;
    disconnect(): this;
    play(track: string | {
        track: string;
    }, options: PlayOptions): Promise<this>;
    stop(): Promise<this>;
    pause(state?: boolean): Promise<this>;
    resume(): Promise<this>;
    seek(position: number): Promise<this>;
    destroy(): Promise<this>;
    setVolume(volume: number): Promise<this>;
    setEqualizer(...gains: number[]): Promise<this>;
    setEqualizer(...bands: Lavalink.EqualizerBand[]): Promise<this>;
    setFilters(): Promise<this>;
    setFilters(filters: Partial<Lavalink.FilterData>): Promise<this>;
    setFilters<F extends Lavalink.Filter>(filter: F, data: Lavalink.FilterData[F]): Promise<this>;
    handleVoiceUpdate(update: VoiceStateUpdate | VoiceServerUpdate): Promise<this>;
    handleEvent(event: Lavalink.PlayerEvent): void;
}
export type PlayOptions = Omit<Lavalink.PlayData, "track">;
export interface PlayerEvents extends ListenerMap {
    trackStart: [track: string];
    trackEnd: [track: string | null, reason: Lavalink.TrackEndReason];
    trackException: [track: string | null, error: Error];
    trackStuck: [track: string | null, thresholdMs: number];
    channelLeave: [code: number, reason: string, byRemote: boolean];
    channelMove: [from: Snowflake | null, to: Snowflake | null];
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

export type Snowflake = string;
export type DiscordResource = {
    id: Snowflake;
};
export type Dictionary<V = any, K extends string | symbol = string> = Record<K, V>;

export class Cluster extends EventBus<ClusterEvents> {
    readonly nodes: Map<String, ClusterNode>;
    readonly sendGatewayPayload: SendGatewayPayload;
    userId?: Snowflake;
    constructor(options: ClusterOptions);
    get rest(): REST;
    get idealNodes(): ClusterNode[];
    connect(user?: Snowflake | DiscordResource | undefined): void;
    createPlayer(guild: Snowflake | DiscordResource, nodeId?: string): Player<ClusterNode>;
    destroyPlayer(guild: Snowflake | DiscordResource): boolean;
    handleVoiceUpdate(update: VoiceServerUpdate | VoiceStateUpdate): void;
    getNode(guild: Snowflake | DiscordResource): ClusterNode | null;
}
export interface ClusterEvents extends ListenerMap {
    nodeConnect: [node: ClusterNode, event: ConnectEvent];
    nodeDisconnect: [node: ClusterNode, event: DisconnectEvent];
    nodeError: [node: ClusterNode, error: Error];
    nodeDebug: [node: ClusterNode, message: string];
}
export interface ClusterOptions {
    nodes: ClusterNodeOptions[];
    sendGatewayPayload: SendGatewayPayload;
    user?: Snowflake | DiscordResource;
}
export interface ClusterNodeOptions extends ConnectionInfo {
    id: string;
}

export class ClusterNode extends Node {
    readonly cluster: Cluster;
    readonly id: string;
    constructor(cluster: Cluster, id: string, info: ConnectionInfo);
}

export class Node extends EventBus<NodeEvents> {
    static DEBUG_FORMAT: string;
    static DEBUG_FORMAT_PLAYER: string;
    static DEFAULT_STATS: Lavalink.StatsData;
    readonly players: Map<string, Player<this>>;
    readonly conn: Connection;
    readonly rest: REST;
    sendGatewayPayload: SendGatewayPayload;
    state: NodeState;
    stats: Lavalink.StatsData;
    userId?: Snowflake;
    constructor(options: NodeOptions);
    get penalties(): number;
    connect(user?: Snowflake | DiscordResource | undefined): void;
    createPlayer(guild: Snowflake | DiscordResource): Player<this>;
    destroyPlayer(guild: Snowflake | DiscordResource): boolean;
    handleVoiceUpdate(update: VoiceStateUpdate | VoiceServerUpdate): void;
    debug(topic: string, message: string, player?: Player): boolean;
}
export type SendGatewayPayload = (id: Snowflake, payload: {
    op: 4;
    d: Dictionary;
}) => void;
export interface NodeEvents extends ListenerMap {
    connect: [event: ConnectEvent];
    disconnect: [event: DisconnectEvent];
    error: [error: Error];
    debug: [message: string];
    raw: [message: Lavalink.IncomingMessage];
}
export interface ConnectEvent {
    took: number;
    reconnect: boolean;
}
export interface DisconnectEvent {
    code: number;
    reason: string;
    reconnecting: boolean;
    wasClean: boolean;
}
export interface NodeOptions {
    connection: ConnectionInfo;
    sendGatewayPayload: SendGatewayPayload;
    user?: Snowflake | {
        id: Snowflake;
    };
}

export enum NodeState {
    Idle = 0,
    Connecting = 1,
    Connected = 2,
    Disconnecting = 3,
    Disconnected = 4,
    Reconnecting = 5
}

export class Connection {
    readonly node: Node;
    readonly info: ConnectionInfo;
    static CLIENT_NAME: string;
    reconnectTry: number;
    payloadQueue: OutgoingPayload[];
    connectedAt?: number;
    constructor(node: Node, info: ConnectionInfo);
    get active(): boolean;
    get canReconnect(): boolean;
    get uptime(): number;
    send(important: boolean, data: Lavalink.OutgoingMessage): Promise<void>;
    connect(): void;
    disconnect(code?: number, reason?: string): void;
    configureResuming(): Promise<void>;
    flushQueue(): void;
    reconnect(): boolean;
}
export type ReconnectDelay = (current: number) => number | Promise<number>;
export interface ConnectionInfo {
    host: string;
    port: number;
    password: string;
    secure?: boolean;
    resuming?: ResumingOptions;
    reconnect?: ReconnectOptions;
}
export interface ResumingOptions {
    key: string;
    timeout?: number;
}
export interface ReconnectOptions {
    delay?: number | ReconnectDelay;
    tries?: number;
}
export interface OutgoingPayload {
    resolve: () => void;
    reject: (error: Error) => void;
    data: Lavalink.OutgoingMessage;
}

export class REST {
    readonly node: Node;
    constructor(node: Node);
    get baseUrl(): string;
    loadTracks(identifier: string): Promise<Lavalink.LoadTracksResponse>;
    decodeTracks(...tracks: string[]): Promise<Lavalink.TrackInfo[]>;
    decodeTrack(track: string): Promise<Lavalink.TrackInfo>;
    do<T>(endpoint: string, options?: Options): Promise<T>;
}
export type Options = Partial<Omit<phin.IWithData<phin.IOptions>, "url" | "headers" | "parse">>;

