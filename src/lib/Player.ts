import * as Types from "@kyflx-dev/lavalink-types";
import { EventEmitter } from "events";
import { Manager } from "./Manager";
import { Socket } from "./Socket";
import * as Util from "./Util";

export class Player extends EventEmitter {
  public channel: string;
  public readonly guild: string;
  public readonly manager: Manager;

  public paused = false;
  public state: Partial<Types.PlayerState> = {};
  public track = "";
  public playing = false;
  public playingTimestamp: number;
  public volume = 100;

  private _state: Util.VoiceState;
  private _server: Util.VoiceServer;

  public constructor(data: Util.PlayerData, public readonly node: Socket) {
    super();

    this.guild = data.guild;
    this.channel = data.channel;
    this.manager = node.manager;

    this.on("event", async (event: Types.Event) => {
      switch (event.type) {
        case "TrackEndEvent":
          if (event.reason !== "REPLACED") this.playing = false;
          this.track = null;
          this.playingTimestamp = null;
          this.emit("end", event);
          break;
        case "TrackExceptionEvent":
          this.emit("error", event.exception ?? event.error);
          break;
        case "TrackStartEvent":
          this.emit("start", event.track);
          break;
        case "TrackStuckEvent":
          await this.stop();
          this.emit("end", event);
          break;
        case "WebSocketClosedEvent":
          this.emit("closed", event);
          break;
      }
    }).on("playerUpdate", (data: Types.PlayerUpdate) =>
      Object.assign(this.state, data.state)
    );
  }

  public play(track: string, options: Util.PlayOptions = {}): Promise<boolean> {
    this.playing = true;
    this.playingTimestamp = Date.now();
    this.track = track;
    return this.send("play", { ...options, track });
  }

  public stop(): Promise<boolean> {
    this.playing = false;
    this.playingTimestamp = null;
    this.track = null;
    return this.send("stop");
  }

  public pause(pause = true): Promise<boolean> {
    this.paused = pause;
    return this.send("pause", { pause });
  }

  public resume(): Promise<boolean> {
    return this.pause(false);
  }

  public seek(position: number): Promise<boolean> {
    return this.send("seek", { position });
  }

  public setVolume(volume: number): Promise<boolean> {
    this.volume = volume;
    return this.send("volume", { volume });
  }

  public equalizer(bands: Types.EqualizerBand[]): Promise<boolean> {
    return this.send("equalizer", { bands });
  }

  public destroy(): Promise<boolean> {
    return this.send("destroy");
  }

  provide(update: Util.VoiceServer | Util.VoiceState): void {
    if ("token" in update) this._server = update;
    else this._state = update;
  }

  async _connect(): Promise<boolean> {
    if (!this._server || !this._state) return;
    return this.send("voiceUpdate", {
      sessionId: this._state.session_id,
      event: this._server,
    });
  }

  protected send(op: string, body: Record<string, any> = {}): Promise<boolean> {
    const guildId = this.guild;
    return this.node.send({ op, ...body, guildId });
  }
}
