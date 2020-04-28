import { EventEmitter } from "events";

import GuildPlayer from "./Player";
import LavaSocket from "./Socket";
import * as Util from "./Util";

export class Manager extends EventEmitter {
  #nodes: Util.SocketData[];

  public reconnectTries: number;
  public userId: string;
  public storeStats: boolean;
  public resumeKey: string;
  public resumeTimeout: number;
  public shards: number;
  public send: (guildId: string, packet: any) => any;

  public plugins: Util.Plugin[] = [];
  public nodes: LavaSocket[] = [];
  public players: GuildPlayer[] = [];

  public constructor(
    nodes: Util.SocketData[],
    private options: Util.ManagerOptions
  ) {
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

  public async init(userId: string = this.userId): Promise<void> {
    this.userId = userId;
    for (const data of this.#nodes.filter((_) => !this.getNode(_.name))) {
      const socket = new this.socket(data, this);
      this.nodes.push(socket);
      this._runPluginMethod("onNewSocket", socket, data);
    }
  }

  public async serverUpdate(server: Util.VoiceServer): Promise<boolean> {
    const player = this.getPlayer(server.guild_id);
    if (!player) return;

    player._provideServer(server);
    return player._update();
  }

  public async stateUpdate(state: Util.VoiceState): Promise<void> {
    if (state.user_id !== this.userId) return;

    const player = this.getPlayer(state.guild_id);
    if (!player) return;

    return player._provideState(state);
  }

  public getPlayer(guildId: string): GuildPlayer {
    return this.players.find((p) => p.guildId === guildId);
  }

  public async leave(guildId: string): Promise<boolean> {
    const player = this.players.find((p) => p.guildId === guildId);
    if (!player) return false;

    await this.send(guildId, {
      op: 4,
      d: {
        guild_id: guildId,
        channel_id: null,
        self_mute: null,
        self_deaf: null,
      },
    });

    this.players.splice(
      this.players.findIndex((p) => p.guildId === guildId),
      1
    );

    player.removeAllListeners();

    return true;
  }

  public async join(
    data: Util.PlayerData,
    options: Util.ConnectOptions = {}
  ): Promise<GuildPlayer> {
    const existing = this.getPlayer(data.guild);
    if (existing) return existing;

    const node =
      data.node instanceof LavaSocket ? data.node : this.getNode(data.node);
    if (!node) throw new Error("Lava#summonPlayer: No node avaliable.");

    const player = new this.player(data, node);
    this.players.push(player);
    this._runPluginMethod("onPlayerSummon", player);

    await this.send(data.guild, {
      op: 4,
      d: {
        guild_id: data.guild,
        channel_id: data.channel,
        self_mute: options.mute ?? false,
        self_deaf: options.deaf ?? false,
      },
    });

    return player;
  }

  public getNode(name?: string): LavaSocket {
    if (!name) {
      if (!this.storeStats) return;
      return this.nodes.sort((a, b) => b.penalties - a.penalties)[0];
    }

    return this.nodes.find((s) => s.name === name);
  }

  public removeNode(name: string): boolean {
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

  private _runPluginMethod(method: keyof Util.Plugin, ...args: any[]): void {
    for (const plugin of this.plugins) {
      if (plugin[method]) {
        (plugin[method] as Function)(...args);
      }
    }
  }
}
