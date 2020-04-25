import { EventEmitter } from "events";

import GuildPlayer from "./Player";
import LavaSocket, { SocketOptions } from "./Socket";

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

type SendPacketFunction = (guildId: string, packet: any) => any;
export interface ManagerOptions {
  resumeKey?: string;
  tries?: number;
  storeStats?: boolean;
  send: SendPacketFunction;
  resumeTimeout?: number;
  shards?: number;
}

export class Manager extends EventEmitter {
  #nodes: SocketOptions[];

  public reconnectTries: number;
  public userId: string;
  public storeStats: boolean;
  public resumeKey: string;
  public resumeTimeout: number;
  public shards: number;
  public send: SendPacketFunction;

  public nodes: LavaSocket[] = [];
  public players: GuildPlayer[] = [];

  public constructor(nodes: SocketOptions[], options: ManagerOptions) {
    super();

    this.reconnectTries = options.tries ?? 3;
    this.storeStats = options.storeStats ?? true;
    this.resumeKey = options.resumeKey ?? null;
    this.resumeTimeout = options.resumeTimeout ?? 60;
    this.shards = options.shards ?? 1;

    if (!nodes)
      throw new Error("Lava: Please provide an array of socket options.");
    if (!options.send || typeof options.send !== "function")
      throw new TypeError("Lava: Please provide a send method.");

    this.send = options.send;
    this.#nodes = nodes;
  }

  public async init(userId: string = this.userId) {
    if (!userId)
      throw new TypeError("Lava#init: Please provide the bot user id.");

    this.userId = userId;
    for await (const options of this.#nodes.filter(n => !this.getNode(n.name))) {
      const socket = new LavaSocket(options, this);
      try {
        await socket._connect(userId);
        this.nodes.push(socket);
      } catch (error) {
        this.emit("error", error, options.name);
      }
    }

    return true;
  }

  public async serverUpdate(server: VoiceServer) {
    const player = this.getPlayer(server.guild_id);
    if (!player) return;
    player._provideServer(server);
    return player._update();
  }

  public async stateUpdate(state: VoiceState) {
    if (state.user_id !== this.userId) return;
    const player = this.getPlayer(state.guild_id);
    if (!player) return;
    return player._provideState(state);
  }

  /** Player */
  public getPlayer(guildId: string): GuildPlayer {
    return this.players.find((p) => p.guildId === guildId);
  }

  public async removePlayer(guildId: string): Promise<void> {
    const player = this.getPlayer(guildId);
    if (!player) return;

    this.players.splice(
      this.players.findIndex((p) => p.guildId === guildId),
      1
    );

    await player.leave();
    await player.destroy();
  }

  public summonPlayer(
    guildId: string,
    node: LavaSocket = this.getNode()
  ): GuildPlayer {
    const existing = this.getPlayer(guildId);

    if (existing) return existing;
    if (!node) throw new Error("Lava#summonPlayer: No node avaliable.");
    if (!node.connected)
      throw new Error(`Lava: Node "${node.name}" isn't connected`);

    const player = new GuildPlayer(guildId, node, this);
    this.players.push(player);
    return player;
  }

  /** Socket */
  public getNode(name?: string): LavaSocket {
    if (!name) {
      if (!this.storeStats) return null;
      return this.nodes.sort((a, b) => b.penalties - a.penalties)[0];
    }

    return this.nodes.find((s) => s.name === name);
  }

  public async removeNode(name: string): Promise<boolean> {
    try {
      const node = this.nodes.find((s) => s.name === name);
      if (!node) return false;

      this.nodes.splice(
        this.nodes.findIndex((s) => s.name === name),
        1
      );

      return true;
    } catch (error) {
      this.emit("error", error, name);
      return false;
    }
  }
}
