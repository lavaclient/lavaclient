import * as http from "http";
import { EventEmitter } from "events";
import { Structures } from "../Structures";

import type { LoadTrackResponse } from "@kyflx-dev/lavalink-types";
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
  public userId: string;
  /**
   * A send method for sending voice state updates to discord.
   */
  public send: Send;
  /**
   * The number of shards the client is running on.
   */
  public shards: number;

  /**
   * An array of registered plugins.
   */
  private readonly plugins: Plugin[] = [];
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

    this.options = options;
    this.userId = options.userId;
    this.send = options.send;
    this.shards = options.shards ?? 1;

    if (!options.send || typeof options.send !== "function")
      throw new TypeError("Manager: Please provide a send function for sending packets to discord.");

    if (this.shards < 1)
      throw new TypeError("Manager: Shard count must be 1 or greater.");

    if (options.plugins && options.plugins.length) {
      for (const plugin of options.plugins) {
        this.plugins.push(plugin);
        plugin.load(this);
      }
    }
  }

  public get ideal(): Socket[] {
    return [ ...this.sockets.values() ]
      .sort((a, b) =>
        (a.stats.cpu ? a.stats.cpu.systemLoad / a.stats.cpu.cores : 0) -
        (b.stats.cpu ? b.stats.cpu.systemLoad / b.stats.cpu.cores : 0)
      );
  }


  /**
   * Initializes this manager. Connects all provided sockets.
   * @param userId The client user id.
   * @since 1.0.0
   */
  public init(userId: string = this.userId): void {
    if (!userId)
      throw new Error("Manager: Provide a userId, either pass it in Manager#init or in the manager options.");

    this.userId = userId;
    this.plugins.forEach((p) => p.init());

    for (const node of this.nodes) {
      if (!this.sockets.has(node.id)) {
        const socket = new (Structures.get("socket"))(this, node);
        socket.connect(userId);
        this.sockets.set(node.id, socket);
      }
    }
  }

  /**
   * Register a plugin for use.
   * @param plugin
   * @since 2.x.x
   */
  public use(plugin: Plugin): Manager {
    this.plugins.push(plugin);
    plugin.load(this);
    return this;
  }

  /**
   * Used for providing voice server updates to lavalink.
   * @param update The voice server update sent by Discord.
   * @since 1.0.0
   */
  public async serverUpdate(update: VoiceServer): Promise<void> {
    if (this.players.has(update.guild_id)) {
      const player = this.players.get(update.guild_id);
      player.provide(update);
      await player.voiceUpdate()
    }
  }

  /**
   * Used for providing voice state updates to lavalink
   * @param update The voice state update sent by Discord.
   * @since 1.0.0
   */
  public async stateUpdate(update: VoiceState): Promise<void> {
    if (update.user_id === this.userId && this.players.has(update.guild_id)) {
      const player = this.players.get(update.guild_id);
      if (update.channel_id !== player.channel) {
        player.emit("move", update.channel_id);
        player.channel = update.channel_id;
      }

      player.provide(update);
      await player.voiceUpdate();
    }
  }

  /**
   * Create a player.
   * @param guild The guild this player is for.
   * @param socket The socket to use, default to ideal. Used for load balancing
   * @since 2.1.0
   */
  public async create(guild: string, socket?: string): Promise<Player> {
    const existing = this.players.get(guild);
    if (existing) return existing;

    let sock = this.sockets.get(socket);
    if (socket && (!sock || !sock.connected))
      throw new Error("Manager#create(): You didn't provide a valid socket.");

    sock = this.ideal[0];
    if (!sock || !sock.connected)
      throw new Error("Manager#create(): No available sockets.")

    const player = new (Structures.get("player"))(sock, guild);
    this.players.set(guild, player);

    return player;
  }

  /**
   * Destroys a player and leaves the connected voice channel.
   * @param guild The guild id of the player to destroy.
   * @since 2.1.0
   */
  public async destroy(guild: string): Promise<boolean> {
    const player = this.players.get(guild);
    if (player) {
      await player.destroy(true);
      return this.players.delete(guild);
    } else return false;
  }

  /**
   * Search lavalink for songs.
   * @param query The search query.
   * @param socket The socket to use .- Load Balancing.
   */
  public async search(query: string, socket?: string): Promise<LoadTrackResponse> {
    return new Promise((resolve, reject) => {
      let sock = this.sockets.get(socket);
      if (socket && (!sock || !sock.connected))
        throw new Error("Manager#search(): You didn't provide a valid socket.");

      sock = this.ideal[0];
      if (!sock || !sock.connected)
        throw new Error("Manager#create(): No available sockets.")

      let data = "";
      const resp = http.get(`http://${sock.host}:${sock.port}/loadtracks?identifier=${query}`, {
        headers: {
          Authorization: sock.password
        }
      }, (res) => {
        res.on("data", (chunk) => data += chunk);

        res.on("error", (e) => {
          resp.abort();
          reject(e);
        });

        res.on("end", () => {
          resp.abort();

          try {
            data = JSON.parse(data);
          } catch (e) {
            reject(e);
            return;
          }

          resolve(data as any);
        })
      });
    });
  }
}

export type Send = (guildId: string, payload: any) => any;

export interface ManagerOptions {
  send: Send;
  shards?: number;
  userId?: string;
  defaultSocketOptions?: SocketOptions;
  plugins?: Plugin[];
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
