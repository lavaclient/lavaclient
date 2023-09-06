import { setTimeout } from "node:timers/promises";

import EventEmitter from "events";
import type { EventMap, default as TypedEmitter } from "typed-emitter";
const Emitter = EventEmitter as { new <T extends EventMap>(): TypedEmitter<T> };

//
import * as Protocol from "lavalink-protocol";
import * as API from "lavalink-api-client";
import WebSocket from "ws";

import * as TF from "@effect/schema/TreeFormatter";
import * as S from "@effect/schema/Schema";

const decoder = new TextDecoder();

// TODO: better error handling

export enum LavalinkWSClientState {
    /** The client is doing nothing. */
    Idle,

    /** The client is handshaking. */
    Handshaking,

    /** The client is ready. */
    Ready,

    /** Currently connecting to the WebSocket. */
    Connecting,

    /** Currently reconnecting to the WebSocket. */
    Reconnecting,

    /** Currently disconnecting from the WebSocket. */
    Disconnecting,
}

export class LavalinkWSClient extends Emitter<LavalinkWSClientEvents> {
    /**
     * The current websocket connection, or null if there is none.
     */
    socket: WebSocket | null = null;

    /**
     * The session for this connection, it also acts as an entry point to the API.
     */
    session: API.SessionAPI | null = null;

    /**
     * The statistics for this connection.
     */
    stats: Protocol.Stats | null = null;

    /**
     * The current state.
     */
    state: LavalinkWSClientState = LavalinkWSClientState.Idle;

    private userId: string | undefined;
    private reconnectionPromise?: (connected: boolean) => void;
    private connectedAt?: number;
    private readyAt?: number;

    private reconnectTry = 0;

    constructor(
        readonly api: API.LavalinkAPI,
        readonly options: LavalinkWSClientOptions = {},
    ) {
        super();
        this.userId = options.userId;
    }

    /**
     * Whether the client is currently active.
     */
    get active(): boolean {
        return this.socket != null && this.socket.readyState === WebSocket.OPEN;
    }

    /**
     * The number of milliseconds the client has been connected for.
     */
    get uptime() {
        const reference = this.readyAt ?? this.connectedAt;
        return reference ? performance.now() - reference : -1;
    }

    /**
     * Make a websocket connection to the lavalink node.
     *
     * @param userId The user id to authenticate as.
     */
    connect(userId: string | undefined = this.userId) {
        this.userId ??= userId;
        
        if (!userId) {
            throw new Error("No user id was provided.");
        }

        /* construct the headers to use. */
        const headers: Record<string, string> = {};
        headers["User-Id"] = userId;
        headers["Authorization"] = this.api.client.options.auth;
        headers["Client-Name"] = this.options.clientName ?? "lavalink-ws-client v1.0.0";

        if (this.session && shouldResume(this.options)) {
            // resume
            headers["Session-Id"] = this.session.id;
        }

        /* create the url to connect to. */
        const url = new URL("/v4/websocket", API.getURI("ws", this.api.client.options));
        this.emit("debug", `creating websocket connection to ${url.toString()}; state=${this.state}`);

        /* create the websocket connection. */
        if (this.state !== LavalinkWSClientState.Reconnecting) {
            this.state = LavalinkWSClientState.Connecting;
        }

        const socket = new WebSocket(url, { headers: headers });
        socket.onopen = this._onopen.bind(this);
        socket.onerror = this._onerror.bind(this);
        socket.onclose = this._onclose.bind(this);
        socket.onmessage = this._onmessage.bind(this);

        this.socket = socket;
        this.connectedAt = performance.now();
    }

    /**
     * Reconnect to the websocket.
     */
    reconnect(): Promise<boolean> {
        this.state = LavalinkWSClientState.Reconnecting;

        return new Promise((res) => {
            this.reconnectionPromise = res;

            try {
                this.connect();
            } catch (cause) {
                console.log(cause);
                this.emit("error", new Error("Unable to reconnect", { cause }));
                return res(false);
            }
        });
    }

    /**
     * Disconnect from the websocket.
     *
     * @param code The close code to use.
     * @param reason The reason for closing.
     * @returns Whether the client was active.
     */
    disconnect(code = 1000, reason = "closing"): boolean {
        if (!this.active) {
            return false;
        }

        this.state = LavalinkWSClientState.Disconnecting;
        this.emit("debug", `disconnecting... code=${code}, reason=${reason}`);

        this.socket?.close(code, reason);
        return true;
    }

    /**
     * Handles the open event from the websocket.
     */
    private _onopen() {
        this.reconnectionPromise?.(true);

        this.emit("debug", `connected in ${this.uptime}ms`);
        this.emit("connected", { took: this.uptime, reconnected: this.state === LavalinkWSClientState.Reconnecting });
        this.state = LavalinkWSClientState.Handshaking;
    }

    /**
     * Handles any error events from the websocket.
     */
    private _onerror(event: WebSocket.ErrorEvent) {
        this.reconnectionPromise?.(false);

        const error = event.error ? event.error : event.message;
        this.emit("error", new Error(error));
    }

    /**
     * Handles any close events from the websocket.
     *
     * @param event The close event.
     */
    private async _onclose({ reason, code, wasClean }: { reason: string; code: number; wasClean: boolean }) {
        if (this.state === LavalinkWSClientState.Reconnecting) {
            this.reconnectionPromise?.(false);
            return;
        }

        const reconnecting =
            shouldReconnect(this.reconnectTry, this.options) && this.state !== LavalinkWSClientState.Disconnecting;

        this.emit("disconnected", { code, reason, wasClean, reconnecting });

        if (!reconnecting) {
            this.emit("debug", "unable to reconnect");
            this.state = LavalinkWSClientState.Idle;
            return;
        }

        do {
            this.reconnectTry++;

            if (!shouldReconnect(this.reconnectTry, this.options)) {
                this.emit("debug", "ran out of reconnect tries");
                this.emit("disconnected", { code, reason, wasClean, reconnecting: false });
                this.state = LavalinkWSClientState.Idle;
                return;
            }

            const duration =
                typeof this.options.reconnecting?.delay === "function"
                    ? await this.options.reconnecting.delay(this.reconnectTry)
                    : this.options.reconnecting?.delay ?? 5_000;

            this.emit("debug", `attempting to reconnect in ${duration}ms, try=${this.reconnectTry}`);

            await setTimeout(duration);
        } while (!(await this.reconnect()));
    }

    /**
     * Handles any message events from the websocket.
     *
     * @param event The message event.
     */
    private async _onmessage({ data }: WebSocket.MessageEvent) {
        if (Array.isArray(data)) {
            data = Buffer.concat(data);
        }

        const text = typeof data === "string" ? data : decoder.decode(data);

        /* decode the websocket message. */
        let payload: unknown;
        try {
            payload = JSON.parse(text);
        } catch (cause) {
            this.emit("error", new Error("Unable to decode WebSocket message", { cause }));
            return;
        }

        /* parse the protocol message. */
        const result = S.parseEither(Protocol.message)(payload);
        if (result._tag === "Left") {
            const error = new Error(TF.formatErrors(result.left.errors), {
                cause: "Unable to parse WebSocket message",
            });

            this.emit("error", error);
            return;
        }

        /* handle the websocket message. */
        const message = result.right;
        if (message.op === "stats") {
            this.stats = message;
        } else if (message.op === "ready") {
            this.readyAt = performance.now();
            this.state = LavalinkWSClientState.Ready;
            this.session = this.api.session(message.sessionId);
            this.emit("ready", { took: this.uptime, resumed: message.resumed });

            // try to update the session.
            try {
                if (this.options.resuming != false) {
                    await this.session.update({ resuming: true, timeout: this.options.resuming?.timeout ?? 60_000 });
                } else {
                    await this.session.update({ resuming: false });
                }
            } catch (cause) {
                const error = new Error("Unable to update session", { cause });
                this.emit("error", error);
            }
        }

        this.emit("debug", `<<< ${message.op}: ${text}`);
        this.emit("message", message);
    }
}

const shouldResume = (options: LavalinkWSClientOptions) => options.resuming ?? true;

const shouldReconnect = (index: number, options: LavalinkWSClientOptions) => {
    const maxTries = options.reconnecting?.tries ?? Infinity;
    return Boolean(options.reconnecting) && maxTries > index;
};

export interface LavalinkWSClientReadyEvent {
    /**
     * The number of milliseconds it took to ready up.
     */
    took: number;
    /**
     * Whether the connection was resumed.
     */
    resumed: boolean;
}

export interface LavalinkWSClientConnectedEvent {
    /**
     * The number of milliseconds it took to connect.
     */
    took: number;
    /**
     * Whether the connection was resumed.
     */
    reconnected: boolean;
}

export interface LavalinkWSClientDisconnectedEvent {
    /**
     * The close code.
     */
    code: number;
    /**
     * The reason for the close.
     */
    reason: string;
    /**
     * Whether the connection was closed cleanly.
     */
    wasClean: boolean;
    /**
     * Whether the connection is going to automatically reeconnect.
     */
    reconnecting: boolean;
}

export type LavalinkWSClientEvents = {
    /** Emitted when the client becomes ready. */
    ready: (event: LavalinkWSClientReadyEvent) => void;

    /** Emitted when the client connects to the websocket. */
    connected: (event: LavalinkWSClientConnectedEvent) => void;

    /** Emitted when the client gets disconnected. */
    disconnected: (event: LavalinkWSClientDisconnectedEvent) => void;

    /** Emitted when a message is received by the client. */
    message: (message: Protocol.Message) => void;

    /** Emitted when the client encounters an error. */
    error: (error: Error) => void;

    /**  */
    debug: (message: string) => void;
};

/**
 * A function that returns the delay to wait before reconnecting.
 */
export type LavalinkWSClientReconnectFn = (attempt: number) => number | Promise<number>;

export interface LavalinkWSClientReconnectOptions {
    /**
     * The delay to wait before reconnecting, defaults to *5 seconds* (`5000`).
     */
    delay?: number | LavalinkWSClientReconnectFn;

    /**
     * The max number of reconnects to attempt before giving up, defaults to `Infinity`.
     */
    tries?: number;
}

export interface LavalinkWSClientOptions {
    /**
     * Whether resuming should be enabled, defaults to `true`.
     */
    resuming?:
        | false
        | {
              /**
               * The resuming timeout in milliseconds, defaults to `60_000` (1 minute).
               */
              timeout: number;
          };

    /**
     * Options used for reconnection.
     */
    reconnecting?: LavalinkWSClientReconnectOptions;

    /**
     * The user id to authenticate with.
     */
    userId?: string;

    /**
     * The client name to use.
     */
    clientName?: string;
}
