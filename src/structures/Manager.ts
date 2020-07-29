import { get } from "http";
import { EventEmitter } from "events";
import { Structures } from "../Structures";

import type WebSocket from "ws";
import type { LoadTracksResponse } from "@lavaclient/types";
import type { Socket, SocketData, SocketOptions } from "./Socket";
import type { Plugin } from "./Plugin";
import type { Player } from "./Player";

export class Manager extends EventEmitter {
  /**
   * A map of connected sockets.
   */
  public readonly sockets: Map<string, Socket>;
  /**
   * A map of connected players.
   */
  public readonly players: Map<string, Player>;

  /**
   * The options this manager was created with.
   */
  public options: ManagerOptions;
  /**
   * The client's user id.
   */
  public userId: string | undefined;
  /**
   * A send method for sending voice state updates to discord.
   */
  public send: Send;
  /**
   * The number of shards the client is running on.
   */
  public shards: number;
  /**
   * If resuming is enabled.
   */
  public resuming: boolean;

  /**
   * An array of registered plugins.
   */
  private plugins: Plugin[] = [];
  /**
   * The array of socket data this manager was created with.
   */
  private readonly nodes: SocketData[];

  /**
   * @param nodes An array of sockets to connect to.
   * @param options
   */
  public constructor(nodes: SocketData[], options: ManagerOptions) {
    super();

    this.nodes = nodes;
    this.sockets = new Map();
    this.players = new Map();

    this.resuming = options.resuming ?? true;
    this.options = options;
    this.userId = options.userId;
    this.send = options.send;
    this.shards = options.shards ?? 1;

    if (!options.send || typeof options.send !== "function")
      throw new TypeError("Please provide a send function for sending packets to discord.");

    if (this.shards < 1)
      throw new TypeError("Shard count must be 1 or greater.");

    if (options.plugins && options.plugins.length)
      options.plugins.forEach((p) => {
        this.plugins.push(p);
        p.load(this);
      });
  }

  /**
   * Ideal nodes to use.
   */
  public get ideal(): Socket[] {
    return [ ...this.sockets.values() ].sort((a, b) => a.penalties - b.penalties);
  }

  /**
   * Initializes this manager. Connects all provided sockets.
   * @param userId The client user id.
   * @since 1.0.0
   */
  public init(userId: string = this.userId!): void {
    this.plugins.forEach((p) => p.init());

    if (!userId) throw new Error("Provide a client id for lavalink to use.");
    else this.userId = userId;

    this.plugins.forEach((p) => p.init());
    this.nodes.forEach((s) => {
      if (this.sockets.has(s.id)) return;
      const socket = new (Structures.get("socket"))(this, s);
      this.sockets.set(s.id, socket.connect());
    })
  }

  /**
   * Register a plugin for use.
   * @param plugin
   * @since 2.x.x
   */
  public use(plugin: Plugin): Manager {
    plugin.load(this);
    this.plugins = this.plugins.concat([ plugin ]);
    return this;
  }

  /**
   * Used for providing voice server updates to lavalink.
   * @param update The voice server update sent by Discord.
   * @since 1.0.0
   */
  public async serverUpdate(update: VoiceServer): Promise<void> {
    const player = this.players.get(update.guild_id);
    if (player) {
      player.provide(update);
      await player.voiceUpdate()
    }

    return;
  }

  /**
   * Used for providing voice state updates to lavalink
   * @param update The voice state update sent by Discord.
   * @since 1.0.0
   */
  public async stateUpdate(update: VoiceState): Promise<void> {
    const player = this.players.get(update.guild_id);
    if (player && update.user_id === this.userId) {
      if (update.channel_id !== player.channel) {
        player.emit("move", update.channel_id);
        player.channel = update.channel_id!;
      }

      player.provide(update);
      await player.voiceUpdate();
    }
  }

  /**
   * Create a player.
   * @param guild The guild this player is for.
   * @since 2.1.0
   */
  public create(guild: string | ObjectLiteral): Player {
    const id = typeof guild === "string" ? guild : guild.id;

    const existing = this.players.get(id);
    if (existing) return existing;

    const sock = this.ideal[0]
    if (!sock)
      throw new Error("Manager#create(): No available nodes.");

    const player = new (Structures.get("player"))(sock, id);
    this.players.set(id, player);

    return player;
  }

  /**
   * Destroys a player and leaves the connected voice channel.
   * @param guild The guild id of the player to destroy.
   * @since 2.1.0
   */
  public async destroy(guild: string | ObjectLiteral): Promise<boolean> {
    const id = typeof guild === "string" ? guild : guild.id;
    const player = this.players.get(id);

    if (player) {
      await player.destroy(true);
      return this.players.delete(id);
    } else return false;
  }

  /**
   * Search lavalink for songs.
   * @param query The search query.
   */
  public async search(query: string): Promise<LoadTracksResponse> {
    return new Promise(async (resolve, reject) => {
      const socket = this.ideal[0];
      if (!socket)
        throw new Error("Manager#create(): No available sockets.")

      const resp = get(`http://${socket.host}:${socket.port}/loadtracks?identifier=${query}`, {
        headers: { authorization: socket.password }
      }, (res) => {
        let data = "";
        res.on("data", (chunk) => data += chunk);
        res.on("error", (e) => reject(e));
        res.on("end", () => resolve(JSON.parse(data)))
      });

      resp.on("error", e => reject(e));
      resp.end();
    });
  }
}

export type Send = (guildId: string, payload: any) => any;

export type ObjectLiteral = Record<string, any>;

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
  resuming?: boolean
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
