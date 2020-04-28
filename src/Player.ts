import * as Types from "@kyflx-dev/lavalink-types";
import { EventEmitter } from "events";

import { Manager } from "./Manager";
import LavaSocket from "./Socket";
import * as Util from "./Util";

export default class GuildPlayer extends EventEmitter {
  public manager: Manager;

  public guildId: string;
  public channelId: string;
  public paused: boolean;
  public state: Types.PlayerState;
  public track: string;
  public playing: boolean;
  public timestamp: number;
  public volume: number;

  private _server: Util.VoiceServer;
  private _state: Util.VoiceState;

  public constructor(data: Util.PlayerData, public node: LavaSocket) {
    super();

    this.guildId = data.guild;
    this.channelId = data.channel;
    this.manager = node.manager;

    this.on("event", async (event: Types.Event) => {
      const emit = (event: string, ...args: any[]): boolean =>
        this.listenerCount(event) ? this.emit(event, ...args) : null;

      switch (event.type) {
        case "TrackEndEvent":
          emit("end", event);

          if (event.reason !== "REPLACED") {
            this.playing = false;
          }

          this.track = null;
          this.timestamp = null;
          break;
        case "TrackExceptionEvent":
          emit("error", event.exception ?? event.error);
          break;
        case "TrackStartEvent":
          emit("start", event.track);
          break;
        case "TrackStuckEvent":
          await this.stop();
          emit("end", event);
          break;
        case "WebSocketClosedEvent":
          emit("closed", event);
          break;
      }
    }).on("playerUpdate", (data: Types.PlayerUpdate) => {
      this.state = data.state;
    });
  }

  public play(track: string, options: Util.PlayOptions = {}): Promise<boolean> {
    this.track = track;
    this.timestamp = Date.now();
    this.playing = true;
    return this.send("play", { track, ...options });
  }

  public stop(): Promise<boolean> {
    this.playing = false;
    this.timestamp = null;
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

  public async destroy(): Promise<boolean> {
    return this.send("destroy");
  }

  _provideServer(server: Util.VoiceServer): void {
    this._server = server;
  }

  _provideState(state: Util.VoiceState): void {
    this._state = state;
  }

  async _update(): Promise<boolean> {
    return this.send("voiceUpdate", {
      sessionId: this._state.session_id,
      event: this._server,
    });
  }

  private send(op: string, body: Record<string, any> = {}): Promise<boolean> {
    const guildId = this.guildId;
    return this.node.send({ op, ...body, guildId });
  }
}
