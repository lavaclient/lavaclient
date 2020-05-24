import { NodeStats } from "@kyflx-dev/lavalink-types";
import WebSocket, { ErrorEvent } from "ws";
import { Manager } from "./Manager";
import { SocketData, SocketOptions, WaitingPayload } from "./Util";

export class Socket {
  public name: string;
  public tries = 0;
  public stats: Partial<NodeStats> = {};
  public resumeKey: string;
  public options: SocketOptions;

  public readonly host: string;
  public readonly port: string;
  public readonly password: string;

  protected ws: WebSocket;
  protected waiting: WaitingPayload[] = [];

  public constructor(data: SocketData, public readonly manager: Manager) {
    this.name = data.id ?? data.host;
    this.host = data.host;
    this.port = data.port.toString();
    this.options =
      data.options ??
      Object.assign(
        { retryDelay: 5000, maxTries: 3, resumeTimeout: 60 },
        manager.options.socketDefaults ?? {}
      );

    Object.defineProperty(this, "password", { value: data.password });
  }

  public get connected(): boolean {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  public send(data: any): Promise<boolean> {
    return new Promise((res, rej) => {
      try {
        data = JSON.stringify(data);
      } catch (error) {
        return this.manager.emit("error", error, this.name);
      }

      if (!this.connected) {
        this.waiting.push({ res, rej, data });
        return true;
      }

      this.ws.send(data, (error) => (error ? rej(error) : res(true)));
    });
  }

  public configureResuming(
    key: string = this.options.resumeKey
  ): Promise<boolean> {
    if (!key) key = Math.random().toString(36);

    this.resumeKey = key;
    return this.send({
      op: "configureResuming",
      key,
      timeout: this.options.resumeTimeout,
    });
  }

  public connect(userId: string): void {
    if (this.ws) {
      if (this.connected) this.ws.close();
      this.ws.removeAllListeners();
      this.ws = null;
    }

    const headers: Record<string, string> = {
      "User-Id": userId,
      "Num-Shards": this.manager.shards.toString(),
      Authorization: this.password,
    };
    if (this.resumeKey) headers["Resume-Key"] = this.resumeKey;

    this.ws = new WebSocket(`ws://${this.host}:${this.port}`, { headers })
      .on("open", this.onOpen.bind(this))
      .on("error", this.onError.bind(this))
      .on("close", this.onClose.bind(this))
      .on("message", this.onMessage.bind(this));
  }

  protected async flush(): Promise<void> {
    await Promise.all(
      this.waiting.map(({ data, rej, res }) =>
        this.ws.send(data, (e) => (e ? rej(e) : res(true)))
      )
    );
    this.waiting = [];
  }

  private onOpen(): void {
    this.manager.emit("open", this.name);
    this.flush()
      .then(() => this.configureResuming())
      .catch((e) => this.manager.emit("error", e, this.name));
  }

  private onError(error: ErrorEvent): void {
    this.manager.emit("error", error, this.name);
    this.reconnect();
  }

  private onClose(code: number, reason: string): void {
    this.manager.emit("close", this.name, code, reason);
    this.reconnect();
  }

  private onMessage(data: Buffer | string): void {
    if (Array.isArray(data)) data = Buffer.concat(data);
    else if (data instanceof ArrayBuffer) data = Buffer.from(data);

    let pk: any;
    try {
      pk = JSON.parse(data.toString());
    } catch (e) {
      this.manager.emit("error", e, this.name);
      return;
    }

    const player = this.manager.players.get(pk.guildId);
    if (pk.guildId && player) player.emit(pk.op, pk);
    if (pk.op === "stats") this.stats = pk;
  }

  private async reconnect(): Promise<void> {
    if (this.tries !== 0) this.tries = 0;
    if (this.tries < this.options.maxTries) {
      this.tries++;
      try {
        await this.connect(this.manager.userId);
      } catch (error) {
        this.manager.emit("error", this.name, error);
        setTimeout(() => this.reconnect(), this.options.retryDelay);
      }
    } else {
      this.manager.nodes.delete(this.name);
      this.manager.emit("disconnect", this.name, "Couldn't reconnect.");
    }
  }
}
