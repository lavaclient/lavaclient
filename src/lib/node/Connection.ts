import WebSocket from "ws";
import { NodeState } from "./NodeState";
import { sleep } from "../Utils";

import type { Node } from "./Node";
import type * as Lavalink from "@lavaclient/types";
import type { Dictionary } from "../../constants";

const _connectedAt = Symbol("Connection#_connectedAt")
const _socket = Symbol("Connection#_socket")

export class Connection {
    static CLIENT_NAME = "lavaclient";

    readonly node: Node;
    readonly info: ConnectionInfo;

    reconnectTry: number;
    payloadQueue: QueuedPayload[] = [];

    private [_connectedAt]?: number;
    private [_socket]?: WebSocket;

    constructor(node: Node, info: ConnectionInfo) {
        this.node = node;
        this.info = info;

        this.reconnectTry = 0;
    }

    get active(): boolean {
        return !!this[_socket] && this[_socket]!.readyState === WebSocket.OPEN;
    }

    get address(): string {
        return `${this.info.host}:${this.info.port}`;
    }

    send(important: boolean, data: Lavalink.OutgoingMessage): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.active) {
                return this._send(data)
                    .then(resolve)
                    .catch(reject);
            }

            this.payloadQueue[important ? "unshift" : "push"]({ resolve, reject, data });
        });
    }

    connect(): void {
        if (!this.node.userId) {
            throw new Error("No User-Id is present.");
        }

        this.disconnect();

        const headers: Dictionary<string> = {
            Authorization: this.info.password,
            "User-Id": this.node.userId,
            "Client-Name": Connection.CLIENT_NAME,
            "Num-Shards": "1"
        };

        if (this.info.resuming?.key) {
            headers["Resume-Key"] = this.info.resuming.key;
        }

        this[_connectedAt] = Date.now();

        const socket = new WebSocket(`ws${this.info.secure ? "s" : ""}://${this.address}`, { headers });
        socket.onopen = this._onopen.bind(this);
        socket.onclose = this._onclose.bind(this);
        socket.onerror = this._onerror.bind(this);
        socket.onmessage = this._onmessage.bind(this);

        this[_socket] = socket;
    }

    disconnect(code = 1000, reason = "closing"): void {
        if (!this.active) {
            return;
        }

        this.node.state = NodeState.Disconnecting;
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

    flushQueue() {
        if (!this.active) {
            return;
        }

        for (const { resolve, reject, data } of this.payloadQueue) {
            this._send(data)
                .then(resolve)
                .catch(reject);
        }

        this.payloadQueue = [];
    }

    reconnect(): boolean {
        this.node.state = NodeState.Reconnecting;

        try {
            this.connect()
        } catch (e) {
            this.node.emit("error", e);
            return false;
        }

        return true;
    }

    private async _onopen() {
        await this.flushQueue();
        await this.configureResuming();

        const took = Date.now() - this[_connectedAt]!;
        this.node.emit("connect", { took, reconnect: this.node.state === NodeState.Reconnecting });
        this.node.state = NodeState.Connected;
    }

    private async _onclose({ reason, code, wasClean }: WebSocket.CloseEvent) {
        if (this.node.state === NodeState.Reconnecting) {
            return;
        }

        const reconnecting = !!this.info.reconnect && this.info.reconnect.tries === -1 ? true : (this.info.reconnect?.tries ?? 3) > this.reconnectTry;
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
            await sleep(duration);
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
            this.node.emit("error", e);
            return;
        }

        switch (payload.op) {
            case "stats":
                this.node.stats = payload;
                break;
            default:
                const player = this.node.players.get(payload.guildId);
                if (player) {
                    if (payload.op === "playerUpdate") {
                        player.position = payload.state.position ?? -1;
                        player.connected = payload.state.connected ?? player.connected;
                        return;
                    }

                    player.handleEvent(payload);
                }
        }
    }

    private _send(payload: Lavalink.OutgoingMessage): Promise<void> {
        const json = JSON.stringify(payload);
        return new Promise((res, rej) => this[_socket]!.send(json, e => e ? rej(e) : res()));
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

export interface QueuedPayload {
    resolve: () => void;
    reject: (error: Error) => void;
    data: Lavalink.OutgoingMessage;
}
