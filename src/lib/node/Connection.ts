import WebSocket from "ws";
import { NodeState } from "./NodeState";

import type * as Lavalink from "@lavaclient/types";
import type { Node } from "./Node";
import type { Dictionary } from "../Utils";

/** @internal */
const _socket = Symbol("Connection#_socket");

export class Connection {
    static CLIENT_NAME = "lavaclient";

    reconnectTry = 0;
    payloadQueue: OutgoingPayload[] = [];
    connectedAt?: number;

    private [_socket]?: WebSocket;

    constructor(readonly node: Node, readonly info: ConnectionInfo) {
    }

    get active(): boolean {
        return !!this[_socket] && this[_socket]?.readyState === WebSocket.OPEN;
    }

    get canReconnect(): boolean {
        const maxTries = this.info.reconnect?.tries === -1 ? Infinity : this.info.reconnect?.tries ?? 5;
        return !!this.info.reconnect && maxTries <= this.reconnectTry;
    }

    get uptime(): number {
        if (!this.connectedAt) return -1;
        return Date.now() - this.connectedAt;
    }

    send(important: boolean, data: Lavalink.OutgoingMessage): Promise<void> {
        return new Promise((resolve, reject) => {
            const payload: OutgoingPayload = { resolve, reject, data };
            this.active
                ? this._send(payload)
                : this.payloadQueue[important ? "unshift" : "push"](payload);
        });
    }

    connect(): void {
        this.disconnect();

        const userId = this.node.userId;
        if (!userId) {
            throw new Error("No User-Id is present.");
        }

        const headers: Dictionary<string> = {
            Authorization: this.info.password,
            "User-Id": userId,
            "Client-Name": Connection.CLIENT_NAME,
            "Num-Shards": "1"
        };

        if (this.info.resuming?.key) {
            headers["Resume-Key"] = this.info.resuming.key;
        }

        if (this.node.state !== NodeState.Reconnecting) {
            this.node.state = NodeState.Connecting;
            this.node.debug("connection", "creating websocket...");
        }

        this.connectedAt = Date.now();

        const socket = this[_socket] = new WebSocket(`ws${this.info.secure ? "s" : ""}://${this.info.host}:${this.info.port}`, { headers });
        socket.onopen = this._onopen.bind(this);
        socket.onclose = this._onclose.bind(this);
        socket.onerror = this._onerror.bind(this);
        socket.onmessage = this._onmessage.bind(this);
    }

    disconnect(code = 1000, reason = "closing"): void {
        if (!this.active) {
            return;
        }

        this.node.state = NodeState.Disconnecting;
        this.node.debug("connection", `disconnecting... code=${code}, reason=${reason}`);

        this[_socket]?.close(code, reason);
    }

    async configureResuming(): Promise<void> {
        if (!this.info.resuming) {
            return;
        }

        await this.send(true, {
            op: "configureResuming",
            key: this.info.resuming.key,
            timeout: this.info.resuming.timeout ?? 60000
        });
    }

    flushQueue(): void {
        if (!this.active) {
            return;
        }

        this.payloadQueue.forEach(this._send.bind(this));
        this.payloadQueue = [];
    }

    reconnect(): boolean {
        this.node.state = NodeState.Reconnecting;

        try {
            this.connect();
        } catch (e) {
            this.node.emit("error", e instanceof Error ? e : new Error(`${e}`));
            return false;
        }

        return true;
    }

    private async _onopen() {
        await this.flushQueue();
        await this.configureResuming();

        this.node.emit("connect", { took: this.uptime, reconnect: this.node.state === NodeState.Reconnecting });
        this.node.debug("connection", `connected in ${this.uptime}ms`);
        this.node.state = NodeState.Connected;
    }

    private async _onclose({ reason, code, wasClean }: WebSocket.CloseEvent) {
        if (this.node.state === NodeState.Reconnecting) {
            return;
        }

        const reconnecting = this.canReconnect && this.node.state !== NodeState.Disconnecting;
        this.node.emit("disconnect", { code, reason, wasClean, reconnecting });
        if (!reconnecting) {
            this.node.state = NodeState.Disconnected;
            return;
        }

        while (!this.reconnect()) {
            const duration = typeof this.info.reconnect?.delay === "function"
                ? await this.info.reconnect.delay(this.reconnectTry)
                : this.info.reconnect?.delay ?? 10000;

            this.reconnectTry++;
            this.node.debug("connection", `attempting to reconnect in ${duration}ms, try=${this.reconnectTry}`);

            await new Promise(res => setTimeout(res, duration));
        }
    }

    private _onerror(event: WebSocket.ErrorEvent) {
        const error = event.error ? event.error : event.message;
        this.node.emit("error", new Error(error));
    }

    private _onmessage({ data }: WebSocket.MessageEvent) {
        if (data instanceof ArrayBuffer) {
            data = Buffer.from(data);
        } else if (Array.isArray(data)) {
            data = Buffer.concat(data);
        }

        let payload: Lavalink.IncomingMessage;
        try {
            payload = JSON.parse(data.toString());
        } catch (e) {
            this.node.emit("error", e instanceof Error ? e : new Error(`${e}`));
            return;
        }

        if (payload.op === "stats") {
            this.node.stats = payload;
        } else {
            const player = this.node.players.get(payload.guildId);
            if (player) {
                if (payload.op === "playerUpdate") {
                    player.position = payload.state.position ?? -1;
                    player.connected = payload.state.connected ?? player.connected;
                } else {
                    player.handleEvent(payload);
                }
            }
        }

        this.node.debug("connection", `${Connection.CLIENT_NAME} <<< ${payload.op}: ${data}`);
        this.node.emit("raw", payload);
    }

    private _send({ data, reject, resolve }: OutgoingPayload): void {
        const json = JSON.stringify(data);
        this.node.debug("connection", `${Connection.CLIENT_NAME} >>> ${data.op}: ${json}`);
        return this[_socket]?.send(json, e => e ? reject(e) : resolve());
    }
}

export type ReconnectDelay = (current: number) => number | Promise<number>;

export interface ConnectionInfo {
    host: string;
    port: number;
    password: string;
    secure?: boolean;
    resuming?: ResumingOptions;
    reconnect?: ReconnectOptions;
}

export interface ResumingOptions {
    key: string;
    timeout?: number;
}

export interface ReconnectOptions {
    delay?: number | ReconnectDelay;
    tries?: number;
}

export interface OutgoingPayload {
    resolve: () => void;
    reject: (error: Error) => void;
    data: Lavalink.OutgoingMessage;
}
