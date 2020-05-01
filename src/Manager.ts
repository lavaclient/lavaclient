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
  private socket: typeof LavaSocket;
  private player: typeof GuildPlayer;

  public plugins: Util.Plugin[] = [];
  public nodes: Map<string, LavaSocket> = new Map();
  public players: Map<string, GuildPlayer> = new Map();

  public constructor(nodes: Util.SocketData[], options: Util.ManagerOptions) {
    super();

    this.#nodes = nodes;
    this.reconnectTries = options.tries ?? 3;
    this.storeStats = options.storeStats ?? true;
    this.resumeKey = options.resumeKey ?? Math.random().toString(36);
    this.resumeTimeout = options.resumeTimeout ?? 60;
    this.shards = options.shards ?? 1;
    this.socket = options.socket ?? LavaSocket;
    this.player = options.player ?? GuildPlayer;
    this.send = options.send;

    if (options.plugins) {
      options.plugins.forEach((plugin) => {
        plugin.manager = this
        this.plugins.push(plugin);
        if (plugin.onLoad) plugin.onLoad();
      });
    }
  }

  public get ideal() {
    if (!this.storeStats) return;
    const ideal = [...this.nodes.values()];
    return ideal.sort((a, b) => b.penalties - a.penalties);
  }

  public async init(userId: string = this.userId): Promise<void> {
    this.userId = userId;
    for (const data of this.#nodes.filter((_) => !this.nodes.get(_.name))) {
      const socket = new this.socket(data, this);
      this.nodes.set(data.name, socket);
      this._runPluginMethod("onNewSocket", socket, data);
    }
  }

  public async serverUpdate(server: Util.VoiceServer): Promise<boolean> {
    const player = this.players.get(server.guild_id);
    if (!player) return;

    player.provide(server);
    return player._update();
  }

  public async stateUpdate(state: Util.VoiceState): Promise<void> {
    if (state.user_id !== this.userId) return;

    const player = this.players.get(state.guild_id);
    if (!player) return;

    return player.provide(state);
  }

  public async leave(guildId: string): Promise<boolean> {
    const player = this.players.get(guildId);
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

    this.players.delete(guildId);
    player.removeAllListeners();
    return true;
  }

  public async join(
    data: Util.PlayerData,
    options: Util.ConnectOptions = {}
  ): Promise<GuildPlayer> {
    const existing = this.players.get(data.guild);
    if (existing) return existing;

    const node = data.node
      ? this.nodes.get(data.node) || this.ideal[0]
      : this.ideal[0];
    if (!node) throw new Error("Lava#summonPlayer: No node avaliable.");

    const player = new this.player(data, node);
    this.players.set(data.guild, player);
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

  private _runPluginMethod(method: keyof Util.Plugin, ...args: any[]): void {
    for (const plugin of this.plugins) {
      if (plugin[method]) {
        (plugin[method] as Function)(...args);
      }
    }
  }
}
