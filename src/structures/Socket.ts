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
    this.host = data.host;
    this.port = data.port.toString();

    this.options = data.options ?? Socket.defaultSocketOptions(manager);
    this.remaining = data.options?.maxTries! ?? 5;
    this.stats = {
      cpu: { cores: 0, lavalinkLoad: 0, systemLoad: 0 },
      frameStats: { deficit: 0, nulled: 0, sent: 0 },
      memory: { allocated: 0, free: 0, reservable: 0, used: 0 },
      players: 0,
      playingPlayers: 0,
      uptime: 0
    }

    Object.defineProperty(this, "password", {
      value: data.password,
      configurable: false,
      writable: false
    });
  }

  /**
   * Whether this socket is connected or not.
   */
  public get connected(): boolean {
    return this.ws! && this.ws!.readyState === WebSocket.OPEN;
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
    return new Promise((res, rej) => {
      const _data = JSON.stringify(data);
      const send: Sendable = { rej, res, data: _data };
      this.connected ? this._send(send) : this.queue.push(send);
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
   * @param userId The user id to use.
   * @since 1.0.0
   */
  public connect(userId: string = this.manager.userId!): Socket {
    if (this.ws) {
      this.ws.removeAllListeners();
      if (this.connected) this.ws.close();
      delete this.ws;
    }

    const headers: Record<string, string> = {};
    headers["User-Id"] = userId;
    headers["Num-Shards"] = this.manager.shards.toString();
    headers["Authorization"] = this.password;
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
  protected async flush(): Promise<void> {
    await Promise.all(this.queue.map(this._send));
    this.queue = [];
  }

  /**
   * WebSocket Open Listener.
   * @since 2.1.0
   * @private
   */
  private _open(): void {
    this.flush()
      .then(() => this.configureResuming())
      .catch((e) => this.manager.emit("socketError", this, e));

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
    this.manager.emit("socketClose", this, event);

    if (event.code !== 1000 && event.reason !== "destroy") {
      await this._reconnect();
    }
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

    let pk;
    try {
      pk = JSON.parse(data.toString());
    } catch (e) {
      this.manager.emit("socketError", this, e);
      return;
    }

    const player = this.manager.players.get(pk.guildId);
    if (pk.guildId && player) player.emit(pk.op, pk);
    else if (pk.op === "stats") this.stats = pk;
  }

  /**
   * Sends data to the websocket.
   * @since 2.1.0
   * @private
   */
  private _send({ data, res, rej }: Sendable): void {
    return this.ws!.send(data, (e) => {
      if (e) {
        this.manager.emit("socketError", this, e);
        return rej(e);
      }

      return res();
    })
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
      this.manager.emit("socketDisconnect", this);
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
  host: string;
  /**
   * The port of your lavalink node.
   */
  port: string | number;
  /**
   * The password of your lavalink node.
   */
  password: string;
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
