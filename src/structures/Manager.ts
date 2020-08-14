import * as https from "https";
import * as http from "http";
import { EventEmitter } from "events";
import { Structures } from "../Structures";

import type WebSocket from "ws";
import type { LoadTracksResponse } from "@lavaclient/types";
import type { Socket, SocketData } from "./Socket";
import type { Plugin } from "./Plugin";
import type { Player } from "./Player";

const defaults = {
  resuming: { key: Math.random().toString(32), timeout: 60000 },
  reconnect: { auto: true, delay: 15000, maxTries: 5 },
  shards: 1,
} as ManagerOptions

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
  public options: Required<ManagerOptions>;

  /**
   * The client's user id.
   */
  public userId: string | undefined;

  /**
   * A send method for sending voice state updates to discord.
   */
  public send: Send;

  /**
   * Resume options.
   */
  public resuming: ResumeOptions;

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

    options = Object.assign(options, defaults);

    this.sockets = new Map();
    this.players = new Map();
    this.nodes = nodes;

    this.options = options as Required<ManagerOptions>;
    this.userId = options.userId;
    this.send = options.send;
    this.resuming = (typeof options.resuming === "boolean"
      ? !options.resuming ? null : defaults.resuming
      : options.resuming ?? defaults.resuming) as ResumeOptions;

    if (!options.send || typeof options.send !== "function")
      throw new TypeError("Please provide a send function for sending packets to discord.");

    if (this.options.shards! < 1)
      throw new TypeError("Shard count must be 1 or greater.");

    if (options.plugins && options.plugins.length)
      for (const plugin of options.plugins) {
        this.plugins.push(plugin);
        plugin.load(this);
      }
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
    if (!userId) throw new Error("Provide a client id for lavalink to use.");
    else this.userId = userId;

    for (const plugin of this.plugins)
      plugin.init();

    for (const s of this.nodes) {
      if (!this.sockets.has(s.id)) {
        const socket = new (Structures.get("socket"))(this, s);
        socket.connect();
        this.sockets.set(s.id, socket);
      }
    }
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
  public create(guild: string | Dictionary): Player {
    const id = typeof guild === "string" ? guild : guild.id;

    const existing = this.players.get(id);
    if (existing) return existing;

    const sock = this.ideal[0];
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
  public async destroy(guild: string | Dictionary): Promise<boolean> {
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

      const { request } = socket.secure ? https : http;
      let res = request(`http${socket.secure ? "s" : ""}://${socket.address}/loadtracks?identifier=${query}`, {
        headers: {
          authorization: socket.password
        }
      }, (res) => {
        let data = Buffer.alloc(0);
        res.on("data", (chunk) => data = Buffer.concat([ data, chunk ]));
        res.on("error", (e) => reject(e));
        res.on("end", () => resolve(JSON.parse(data.toString())))
      });

      res.on("error", e => reject(e));
      res.end();
    });
  }
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
