import WebSocket from "ws";

import type { NodeStats } from "@lavaclient/types";
import type { Manager } from "./Manager";

export class Socket {
  /**
   * The manager this socket belongs to.
   */
  public readonly manager: Manager;
  /**
   * This sockets identifier.
   */
  public readonly id: string;
  /**
   * The host of the lavalink node we're connecting to.
   */
  public readonly host: string;
  /**
   * The port of the lavalink node we're connecting to.
   */
  public readonly port: string;
  /**
   * The authorization being used when connecting.
   */
  public readonly password!: string;

  /**
   * Total remaining tries this socket has for reconnecting
   */
  public remaining: number;
  /**
   * The resume key being used for resuming.
   */
  public resumeKey?: string;
  /**
   * The stats sent by lavalink.
   */
  public stats: NodeStats;
  /**
   * The options this socket is using.
   */
  public options: SocketOptions;

  /**
   * The websocket instance for this socket.
   */
  protected ws?: WebSocket;
  /**
   * The queue for sendables.
   */
  protected queue: Sendable[] = [];

  /**
   * @param manager The manager this socket belongs to.
   * @param data Data to use.
   */
  public constructor(manager: Manager, data: SocketData) {
    this.manager = manager;
    this.id = data.id;
    this.host = data.host ?? "localhost";
    this.port = (data.port ?? 2333).toString();

    this.options = data.options ?? Socket.defaultSocketOptions(manager);
    this.remaining = Number(data.options?.maxTries! ?? 5);
    this.stats = {
      cpu: { cores: 0, lavalinkLoad: 0, systemLoad: 0 },
      frameStats: { deficit: 0, nulled: 0, sent: 0 },
      memory: { allocated: 0, free: 0, reservable: 0, used: 0 },
      players: 0,
      playingPlayers: 0,
      uptime: 0
    }

    Object.defineProperty(this, "password", {
      value: data.password ?? "youshallnotpass"
    });
  }

  /**
   * Whether this socket is connected or not.
   */
  public get connected(): boolean {
    return this.ws! && this.ws!.readyState === WebSocket.OPEN;
  }

  /**
   * Get the total penalty count for this node.
   */
  public get penalties() {
    const cpu = Math.pow(1.05, 100 * this.stats.cpu.systemLoad) * 10 - 10;

    let deficit = 0, nulled = 0;
    if (this.stats.frameStats?.deficit != -1) {
      deficit = Math.pow(1.03, 500 * (this.stats.frameStats?.deficit! / 3000)) * 600 - 600;
      nulled = (Math.pow(1.03, 500 * (this.stats.frameStats?.nulled! / 3000)) * 600 - 600) * 2;
      nulled *= 2;
    }

    return cpu + deficit + nulled;
  }

  /**
   * Get the default socket options.
   * @param manager
   */
  private static defaultSocketOptions(manager: Manager): SocketOptions {
    return Object.assign({
      retryDelay: 5000,
      maxTries: 3,
      resumeTimeout: 60
    }, manager.options.defaultSocketOptions ?? {});
  }

  /**
   * Get the string representation of this socket.
   * @since 3.0.0
   */
  public toString(): string {
    return this.id;
  }

  /**
   * Send data to the websocket.
   * @param data Data to send. - JSON
   * @since 1.0.0
   */
  public send(data: any): Promise<void> {
    return new Promise(async (res, rej) => {
      const _data = JSON.stringify(data);
      this.queue.push({ rej, res, data: _data });
      if (this.connected) await this.checkQueue();
    });
  }

  /**
   * Configure Lavalink Resuming.
   * @param key The resume key.
   * @since 1.0.0
   */
  public async configureResuming(key: string | undefined = this.options.resumeKey): Promise<void> {
    if (this.manager.resuming) {
      if (!key) key = Math.random().toString(32);

      this.resumeKey = key;
      return this.send({
        op: "configureResuming",
        key,
        timeout: this.options.resumeTimeout,
      });
    }
  }

  /**
   * Connects to the WebSocket.
   * @since 1.0.0
   */
  public connect(): this {
    if (this.ws) {
      if (this.connected) this.ws.close();
      delete this.ws;
    }

    const headers: Record<string, any> = {
      "user-id": this.manager.userId!,
      "num-shards": this.manager.shards,
      authorization: this.password
    };
    if (this.resumeKey) headers["Resume-Key"] = this.resumeKey;

    this.ws = new WebSocket(`ws://${this.host}:${this.port}`, { headers });
    this.ws.onclose = this._close.bind(this);
    this.ws.onerror = this._error.bind(this);
    this.ws.onmessage = this._message.bind(this);
    this.ws.onopen = this._open.bind(this);

    return this;
  }

  /**
   * Flushes out the send queue.
   * @since 1.0.0
   */
  protected async checkQueue(): Promise<void> {
    if (this.queue.length === 0) return;

    while (this.queue.length > 0) {
      const next = this.queue.shift();
      if (!next) return;
      this.ws!.send(next.data, (e) => {
        if (e) {
          this.manager.emit("socketError", this, e);
          next.rej(e);
        } else next.res();
      });
    }
  }

  /**
   * WebSocket Open Listener.
   * @since 2.1.0
   * @private
   */
  private async _open(): Promise<void> {
    await this.checkQueue()
    await this.configureResuming()

    this.manager.emit("socketReady", this);
  }

  /**
   * WebSocket Error Listener.
   * @param error The error received.
   * @since 2.1.0
   * @private
   */
  private async _error(error: WebSocket.ErrorEvent): Promise<void> {
    this.manager.emit("socketError", this, error.error);
    await this._reconnect();
  }

  /**
   * WebSocket Close Listener.
   * @param event The event that occurred..
   * @since 2.1.0
   * @private
   */
  private async _close(event: WebSocket.CloseEvent): Promise<void> {
    if (event.code !== 1000 && event.reason !== "destroy") {
      await this._reconnect();
    } else this.manager.emit("socketClose", this);
  }

  /**
   * WebSocket message listener
   * @param data The message received.
   * @since 2.1.0
   * @private
   */
  private _message({ data }: WebSocket.MessageEvent): void {
    if (Array.isArray(data)) data = Buffer.concat(data);
    else if (data instanceof ArrayBuffer) data = Buffer.from(data);

    try {
      const pk = JSON.parse(data.toString());

      if (pk.op === "stats") this.stats = pk;
      if (["event", "playerUpdate"].includes(pk.op)) {
        const player = this.manager.players.get(pk.guildId);
        if (player) player.emit(pk.op, pk);
      }
    } catch (e) {
      this.manager.emit("socketError", this, e);
      return;
    }
  }

  /**
   * Reconnects to the WebSocket.
   * @since 1.0.0
   * @private
   */
  private async _reconnect(): Promise<void> {
    if (this.remaining !== 0) {
      this.remaining--;
      try {
        this.connect();
        this.remaining = this.options.maxTries!;
      } catch (e) {
        this.manager.emit("socketError", this, e);
        setTimeout(() => this._reconnect(), this.options.retryDelay!);
      }
    } else {
      this.manager.sockets.delete(this.id);
      this.manager.emit("socketClose", this);
    }
  }
}

export interface SocketData {
  /**
   * The identifier of your lavalink node.
   */
  id: string;
  /**
   * The hostname of your lavalink node.
   */
  host?: string;
  /**
   * The port of your lavalink node.
   */
  port?: string | number;
  /**
   * The password of your lavalink node.
   */
  password?: string;
  /**
   * Additional socket options.
   */
  options?: SocketOptions;
}

export interface SocketOptions {
  /**
   * The delay in between reconnects.
   */
  retryDelay?: number;
  /**
   * The amount of tries to use when reconnecting.
   */
  maxTries?: number;
  /**
   * The resume key to use.
   */
  resumeKey?: string;
  /**
   * The resume timeout to use.
   */
  resumeTimeout?: number;
}

/**
 * @internal
 */
export interface Sendable {
  res: (...args: any[]) => any;
  rej: (...args: any[]) => any;
  data: string;
}
