import { EventEmitter } from "events";
import { Player } from "./Player";
import { Socket } from "./Socket";
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
  private socket: typeof Socket;
  private player: typeof Player;

  public nodes: Map<string, Socket> = new Map();
  public players: Map<string, Player> = new Map();
  public static plugins: Util.Plugin[] = [];

  public constructor(nodes: Util.SocketData[], options: Util.ManagerOptions) {
    super();

    this.#nodes = nodes;
    this.reconnectTries = options.tries ?? 3;
    this.storeStats = options.storeStats ?? true;
    this.resumeKey = options.resumeKey ?? Math.random().toString(36);
    this.resumeTimeout = options.resumeTimeout ?? 60;
    this.shards = options.shards ?? 1;
    this.socket = options.socket ?? Socket;
    this.player = options.player ?? Player;
    this.send = options.send;

    this._runPluginMethod("onManagerNew", this);
  }

  public get ideal(): Socket[] {
    return [...this.nodes.values()]
      .filter((s) => s.connected)
      .sort((a, b) => {
        if (!this.storeStats) {
          return -1;
        }

        return (
          (a.stats.cpu ? a.stats.cpu.systemLoad / a.stats.cpu.cores : 0) -
          (b.stats.cpu ? b.stats.cpu.systemLoad / b.stats.cpu.cores : 0)
        );
      });
  }

  public async init(userId: string = this.userId): Promise<void> {
    this.userId = userId;

    for (const data of this.#nodes.filter((_) => !this.nodes.get(_.name))) {
      const socket = new this.socket(data, this, data.ws);
      this.nodes.set(data.name, socket);
      this._runPluginMethod("onSocketInit", socket, data);
    }
  }

  public async serverUpdate(server: Util.VoiceServer): Promise<void> {
    const player = this.players.get(server.guild_id);
    if (!player) return;
    player.provide(server);

    return player._connect();
  }

  public async stateUpdate(state: Util.VoiceState): Promise<void> {
    if (state.user_id !== this.userId) return;

    const player = this.players.get(state.guild_id);
    if (state.channel_id && player) {
      player.provide(state);

      return player._connect();
    }

    return;
  }

  public async leave(guildId: string): Promise<void> {
    const player = this.players.get(guildId);
    if (!player) {
      return;
    }

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

    return;
  }

  public async join(
    data: Util.PlayerData,
    options: Util.ConnectOptions = {}
  ): Promise<Player> {
    const existing = this.players.get(data.guild);
    if (existing) {
      return existing;
    }

    const node = data.node
      ? this.nodes.get(data.node) || this.ideal[0]
      : this.ideal[0];
    if (!node) throw new Error("Manager#join: No node avaliable.");

    const player = new this.player(data, node);
    this.players.set(data.guild, player);
    this._runPluginMethod("onJoin", player);

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
    for (const plugin of Manager.plugins) {
      if (plugin[method]) {
        (plugin[method] as Function)(...args);
      }
    }
  }

  public static use(plugin: Util.Plugin): typeof Manager {
    this.plugins.push(plugin);

    return this;
  }
}
