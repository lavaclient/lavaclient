import WebSocket from "ws";
import { EventEmitter } from "events";
import { SocketState } from "./SocketState";

import type { IncomingMessage, OpCode, OutgoingMessage } from "@lavaclient/types";
import type { Player } from "./Player";
import type { Dictionary } from "../types";

export class Socket extends EventEmitter {

  /**
   * Value used for the "Client-Name" header.
   */
  static CLIENT_NAME = "Lavaclient";

  /**
   * Default resuming options.
   */
  static DEFAULT_RESUMING_OPTIONS = (): ResumingOptions => ({
    timeout: 60000,
    key: Math.random().toString(32),
  });

  /**
   * The current players.
   */
  readonly players: Map<string, Player>;

  /**
   * Options supplied to this Socket.
   */
  options: SocketOptions;

  /**
   * The current state of this socket.
   */
  state: SocketState;

  /**
   * The resuming options
   */
  resuming: ResumingOptions | null;

  /**
   * The resume key for this Socket.
   */
  resumeKey: string | null = null;

  /**
   * The message queue.
   */
  protected queue: string[];

  /**
   * The websocket connection.
   */
  protected ws?: WebSocket;

  /**
   * @param options Options to use.
   */
  constructor(options: SocketOptions) {
    super();

    this.queue = [];
    this.players = new Map();
    this.state = SocketState.Idle;
    this.options = options;
    this.resuming = options.resuming === false
      ? null
      : Object.assign(Socket.DEFAULT_RESUMING_OPTIONS(), options.resuming);
  }

  /**
   * The address of this socket.
   */
  get address(): string {
    return `${this.options.address}${this.options.port ? `:${this.options.port}` : ""}`;
  }

  /**
   * Whether this socket is connected to the lavalink node.
   */
  get connected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Sends a message to the node.
   *
   * @param message The message to send.
   * @param prioritized Whether this message is prioritized, only works if we're disconnected.
   */
  async send<O extends OutgoingMessage>(message: O, prioritized: boolean = false): Promise<void> {
    const data = JSON.stringify(message);
    if (this.connected) {
      return new Promise((res, rej) => this.ws?.send(data, (err) => err
        ? rej(err)
        : res()));
    }

    this.queue[prioritized ? "unshift" : "push"](data);
  }

  /**
   * Connects to the node described in {@link Socket#options}
   *
   * @param userId ID of the client to play music with
   */
  connect(userId: string): void {
    if (this.connected) {
      this.disconnect();
    }

    const headers: Dictionary<string> = {
      "Client-Name": Socket.CLIENT_NAME,
      "User-Id": userId,
      "Num-Shards": "1", // only for old lavalink versions
    };

    if (this.state === SocketState.Reconnecting && this.resumeKey) {
      headers["Resume-Key"] = this.resumeKey;
    }

    this.ws = new WebSocket(`${this.options.protocol ?? "ws"}://${this.address}`);
    this.ws.onopen = this._onopen.bind(this);
    this.ws.onclose = this._onclose.bind(this);
    this.ws.onerror = this._onerror.bind(this);
    this.ws.onmessage = this._onmessage.bind(this);
  }

  /**
   *
   * @param {number} close
   * @param {string} reason
   */
  disconnect(close?: number, reason?: string) {
    this.ws?.close(close ?? 1000, reason ?? "disconnecting");
  }

  /**
   * Handles the "open" websocket event.
   */
  protected _onopen() {
    this.emit("connected");

    if (this.queue.length) {
      while (this.queue.length > 0) {
        const payload = this.queue.shift();
        if (!payload) {
          return;
        }

        this.ws?.send(payload, err => {
          if (err) {
            this.emit("error", err);
          }
        });
      }
    }
  }

  /**
   * Handles the "close" websocket event.
   */
  protected _onclose() {
    // TODO: websocket "close" handler.
  }

  /**
   * Handles the "error" websocket event.
   */
  protected _onerror() {
    // TODO: websocket "error" handler.
  }

  /**
   * Handles the "message" websocket event.
   */
  protected _onmessage(event: WebSocket.MessageEvent) {
    this.emit("message", event);
    // TODO: websocket "message" handler.
  }

}

interface SocketEvents {
  "connected": [];
  "error": [ error: Error, event?: WebSocket.ErrorEvent ];
  "message": [ event: WebSocket.MessageEvent ];
  "close": [ event: WebSocket.CloseEvent ];
  "raw": [ message: IncomingMessage ]
}

export interface Socket {
  on<E extends keyof SocketEvents>(event: E, listener: (...args: SocketEvents[E]) => void): this;

  once<E extends keyof SocketEvents>(event: E, listener: (...args: SocketEvents[E]) => void): this;
}

export interface SocketOptions {
  /**
   * The address of the lavalink node.
   */
  address: string;

  /**
   * The password to use.
   */
  password: string;

  /**
   *
   */
  handleOperations?: boolean | OpCode[];

  /**
   * The protocol to use.
   */
  protocol?: "wss" | "ws";

  /**
   * The port the lavalink node is listening on.
   */
  port?: number;

  /**
   * Options for resuming.
   */
  resuming?: ResumingOptions | false;
}

export interface ResumingOptions {
  /**
   * The key used to resume a session.
   */
  key?: string;

  /**
   * How long the un-resumed session will last before getting destroyed.
   */
  timeout?: number;
}

export interface ReconnectOptions {
  /**
   * The delay between reconnects.
   */
  delay: number;

  /**
   * The number of tries before removing this node.
   */
  tries: number;
}
