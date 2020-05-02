import * as Types from "@kyflx-dev/lavalink-types";
import { EventEmitter } from "events";

import Socket from "./Socket";
import * as Util from "./Util";

export default class Player extends EventEmitter {
  public guildId: string;
  public channelId: string;
  public paused: boolean;
  public state: Util.GuildPlayerState = {} as Util.GuildPlayerState;
  public track: string;
  public playing: boolean;
  public timestamp: number;
  public volume: number;

  private _server: Util.VoiceServer;
  private _state: Util.VoiceState;

  public constructor(data: Util.PlayerData, public node: Socket) {
    super();
    this.guildId = data.guild;
    this.channelId = data.channel;

    this.on("event", async (event: Types.Event) => {
      switch (event.type) {
        case "TrackEndEvent":
          if (event.reason !== "REPLACED") this.playing = false;
          this.track = null;
          this.timestamp = null;
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
    Object.assign(this.state, { bands });
    return this.send("equalizer", { bands });
  }

  public async destroy(): Promise<boolean> {
    return this.send("destroy");
  }

  provide(update: Util.VoiceServer | Util.VoiceState): void {
    const isServer = (_: any): _ is Util.VoiceServer => !!_.token;
    if (isServer(update)) this._server = update;
    else this._state = update;
  }

  async _update(): Promise<boolean> {
    return this.send("voiceUpdate", {
      sessionId: this._state.session_id,
      event: this._server,
    });
  }

  protected send(op: string, body: Record<string, any> = {}): Promise<boolean> {
    const guildId = this.guildId;
    return this.node.send({ op, ...body, guildId });
  }
}
