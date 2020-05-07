import { NodeStats } from "@kyflx-dev/lavalink-types";
import WebSocket, { ClientOptions } from "ws";

import { Manager } from "./Manager";
import * as Util from "./Util";

export class Socket {
  #ws: WebSocket;

  public name: string;
  public tries = 0;
  public stats: Partial<NodeStats> = {};
  protected waiting: Util.WaitingPayload[] = [];

  #address: string;
  #port: string;
  #password: string;

  public constructor(
    data: Util.SocketData,
    public manager: Manager,
    public options: ClientOptions = {}
  ) {
    this.name = data.name;
    this.#address = data.address;
    this.#port = data.port.toString();
    this.#password = data.password;

    this._connect(manager.userId);
  }

  public get connected(): boolean {
    return this.#ws && this.#ws.readyState === WebSocket.OPEN;
  }

  public send(payload: any): Promise<void> {
    return new Promise((res, rej) => {
      try {
        payload = JSON.stringify(payload);
      } catch (error) {
        this.manager.emit("error", error, this.name);

        return;
      }

      if (!this.connected) {
        this.waiting.push({ res, rej, payload });

        return;
      }

      this.#ws.send(payload, (error) => {
        if (error) {
          this.manager.emit("error", error, this.name);

          return rej(error);
        }

        return res();
      });
    });
  }

  protected async flush(): Promise<void> {
    await Promise.all(
      this.waiting.map(({ payload, rej, res }) =>
        this.#ws.send(payload, (e) => (e ? rej(e) : res(true)))
      )
    );
    this.waiting = [];
  }

  private async _connect(userId: string): Promise<void> {
    const headers: Record<string, any> = {
      "User-Id": userId.toString(),
      Authorization: this.#password,
      "Num-Shards": this.manager.shards,
    };

    if (this.manager.resumeKey) headers["Resume-Key"] = this.manager.resumeKey;

    const url = `ws://${this.#address}:${this.#port}`;
    this.#ws = new WebSocket(url, Object.assign({ headers }, this.options));

    this.#ws.on("close", this._close.bind(this));
    this.#ws.on("error", this._error.bind(this));
    this.#ws.on("message", this._message.bind(this));
    this.#ws.on("open", this._open.bind(this));
  }

  private async _configureResuming(): Promise<void> {
    return this.send({
      op: "configureResuming",
      timeout: this.manager.resumeTimeout,
      key: this.manager.resumeKey,
    });
  }

  private _open(): Promise<void> {
    return this.flush().then(async () => {
      await this._configureResuming();
      this.manager.emit("open", this.name);
    });
  }

  private async _message(message: string): Promise<void> {
    let data;
    try {
      data = JSON.parse(message);
    } catch (error) {
      this.manager.emit("error", error, this.name);
      return;
    }

    const player = this.manager.players.get(data.guildId);
    switch (data.op) {
      case "stats":
        if (this.manager.storeStats) {
          this.stats = data;
        }

        break;
      case "event":
      case "playerUpdate":
        if (player) {
          player.emit(data.op, data);
        }

        break;
    }

    this.manager.emit("raw", data);
  }

  private async _error(error: string): Promise<void> {
    this.manager.emit("error", error, this.name);
    this.#ws.close(4011, "reconnecting");
  }

  private async _close(code: number, reason: string): Promise<void> {
    this.#ws.removeAllListeners();
    this.#ws = null;
    await this.reconnect(code, reason);
  }

  private async reconnect(code: number, reason: string): Promise<void> {
    this.manager.emit("close", this.name, reason, code);

    if (this.tries < this.manager.reconnectTries) {
      this.tries++;
      try {
        await this._connect(this.manager.userId);
      } catch (error) {
        this.manager.emit("error", this.name, error);
        setTimeout(() => this.reconnect(code, reason), 2500);
      }
    } else {
      this.manager.nodes.delete(this.name);
      this.manager.emit("disconnect", this.name, "Couldn't reconnect.");
    }
  }
}
