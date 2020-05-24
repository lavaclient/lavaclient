import { EventEmitter } from "events";
import { Player } from "./Player";
import { Socket } from "./Socket";
import * as Util from "./Util";

const plugins: Util.Plugin[] = [];

export class Manager extends EventEmitter {
  #nodes: Util.SocketData[] = [];

  public userId: string;
  public send: Util.SendFunction;
  public shards: number;

  public readonly players: Map<string, Player> = new Map();
  public readonly nodes: Map<string, Socket> = new Map();

  public constructor(
    nodes: Util.SocketData[],
    public readonly options: Util.ManagerOptions
  ) {
    super();

    this.#nodes = nodes ?? [];
    this.userId = options.userId;
    this.shards = options.shards ?? 1;

    if (!options.send || typeof options.send !== "function") {
      throw new Error("[Lavaclient] Provide a Send Function.");
    } else this.send = options.send;

    plugins.forEach((p) => p.register(this));
  }

  public get ideal(): Socket[] {
    return [...this.nodes.values()]
      .filter((s) => s.connected)
      .sort((a, b) => {
        return (
          (a.stats.cpu ? a.stats.cpu.systemLoad / a.stats.cpu.cores : 0) -
          (b.stats.cpu ? b.stats.cpu.systemLoad / b.stats.cpu.cores : 0)
        );
      });
  }

  public async init(userId: string = this.userId): Promise<void> {
    this.userId = userId;
    if (!userId)
      throw new Error(
        "[Lavaclient] Provide a userId, either pass it in Manager#init or in the manager options."
      );

    for (const o of this.#nodes.filter((n) => !this.nodes.has(n.id))) {
      const socket = new (Util.Structures.get("socket"))(o, this);
      socket.connect(userId);
      this.nodes.set(o.id, socket);
    }
  }

  public serverUpdate(update: Util.VoiceServer): void {
    const player = this.players.get(update.guild_id);
    if (player) {
      player.provide(update);
      player._connect();
    }
  }

  public stateUpdate(update: Util.VoiceState): void {
    if (update.user_id !== this.userId) return;

    const player = this.players.get(update.guild_id);
    if (update.channel_id && player) {
      if (update.channel_id !== player.channel) {
        player.emit("move", update.channel_id);
        player.channel = update.channel_id;
      }

      player.provide(update);
      player._connect();
    }
  }

  public async leave(guildId: string): Promise<void> {
    const player = this.players.get(guildId);
    if (!player) return;

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
  }

  public async join(
    data: Util.PlayerData,
    options: Util.ConnectOptions = {}
  ): Promise<Player> {
    const existing = this.players.get(data.guild);
    if (existing) return existing;

    const node = data.node ? this.nodes.get(data.node) : this.ideal[0];
    if (!node || !node.connected)
      throw new Error("Manager#join: You didn't provide a valid node.");

    const player = new (Util.Structures.get("player"))(data, node);
    this.players.set(data.guild, player);

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

  public static use(plugin: Util.Plugin): typeof Manager {
    plugin.preRegister();
    plugins.push(plugin);
    return this;
  }
}
