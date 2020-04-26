import { EventEmitter } from "events";

import GuildPlayer from "./Player";
import LavaSocket, { SocketOptions } from "./Socket";
import { Plugin } from "./Plugin";
import { VoiceServer, VoiceState } from ".";

type SendPacketFunction = (guildId: string, packet: any) => any;
export interface ManagerOptions {
  resumeKey?: string;
  tries?: number;
  storeStats?: boolean;
  send: SendPacketFunction;
  resumeTimeout?: number;
  shards?: number;
  plugins?: Plugin[];
  socket?: typeof LavaSocket;
  player?: typeof GuildPlayer;
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

  public plugins: Plugin[] = [];
  public nodes: LavaSocket[] = [];
  public players: GuildPlayer[] = [];

  public constructor(nodes: SocketOptions[], private options: ManagerOptions) {
    super();

    this.reconnectTries = options.tries ?? 3;
    this.storeStats = options.storeStats ?? true;
    this.resumeKey = options.resumeKey ?? Math.random().toString(36);
    this.resumeTimeout = options.resumeTimeout ?? 60;
    this.shards = options.shards ?? 1;

    if (options.plugins && Array.isArray(options.plugins)) {
      for (const plugin of options.plugins) {
        try {
          plugin.manager = this;
          this.plugins.push(plugin);
          if (plugin.onLoad) plugin.onLoad();
        } catch (error) {
          this.emit("error", error);
        }
      }
    }

    this.send = options.send;
    this.#nodes = nodes;
  }

  get player(): typeof GuildPlayer {
    if (
      this.options.player &&
      Object.getPrototypeOf(this.options.player) === GuildPlayer
    ) {
      return this.options.player;
    }

    return GuildPlayer;
  }

  get socket(): typeof LavaSocket {
    if (
      this.options.socket &&
      Object.getPrototypeOf(this.options.socket) === LavaSocket
    ) {
      return this.options.socket;
    }

    return LavaSocket;
  }

  public async init(userId: string = this.userId): Promise<boolean> {
    if (!userId) {
      throw new TypeError("Lava#init: Please provide the bot user id.");
    }

    this.userId = userId;
    for await (const options of this.#nodes.filter(
      (n) => !this.getNode(n.name)
    )) {
      const socket = new this.socket(options, this);
      try {
        await socket._connect(userId);
        this.nodes.push(socket);
        this._runPluginMethod("onNewSocket", socket, options);
      } catch (error) {
        this.emit("error", error, options.name);
      }
    }

    return true;
  }

  public async serverUpdate(server: VoiceServer): Promise<boolean> {
    const player = this.getPlayer(server.guild_id);
    if (!player) {
      return;
    }

    player._provideServer(server);
    return player._update();
  }

  public async stateUpdate(state: VoiceState): Promise<void> {
    if (state.user_id !== this.userId) {
      return;
    }

    const player = this.getPlayer(state.guild_id);
    if (!player) {
      return;
    }

    return player._provideState(state);
  }

  public getPlayer(guildId: string): GuildPlayer {
    return this.players.find((p) => p.guildId === guildId);
  }

  public async removePlayer(guildId: string): Promise<void> {
    const player = this.getPlayer(guildId);
    if (!player) {
      return;
    }

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

    if (existing) {
      return existing;
    }

    if (!node) {
      throw new Error("Lava#summonPlayer: No node avaliable.");
    }

    if (!node.connected) {
      throw new Error(`Lava: Node "${node.name}" isn't connected`);
    }

    const player = new this.player(guildId, node, this);
    this.players.push(player);
    this._runPluginMethod("onPlayerSummon", player);
    return player;
  }

  public getNode(name?: string): LavaSocket {
    if (!name) {
      if (!this.storeStats) {
        return;
      }

      return this.nodes.sort((a, b) => b.penalties - a.penalties)[0];
    }

    return this.nodes.find((s) => s.name === name);
  }

  public removeNode(name: string): boolean {
    try {
      const node = this.nodes.find((s) => s.name === name);
      if (!node) {
        return false;
      }

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

  _runPluginMethod(method: keyof Plugin, ...args: any[]): void {
    for (const plugin of this.plugins) {
      if (plugin[method]) {
        (plugin[method] as Function)(...args);
      }
    }
  }
}
