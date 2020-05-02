import { PlayTrack, EqualizerBand, PlayerState } from "@kyflx-dev/lavalink-types";

import { Manager } from "./Manager";
import Player from "./Player";
import Socket from "./Socket";

export type PlayOptions = Partial<Omit<PlayTrack, "op" | "guildId" | "track">>;

export interface ConnectOptions {
  deaf?: boolean;
  mute?: boolean;
}

export interface ManagerOptions {
  resumeKey?: string;
  tries?: number;
  storeStats?: boolean;
  send: (guildId: string, packet: any) => any;
  resumeTimeout?: number;
  shards?: number;
  plugins?: Plugin[];
  socket?: typeof Socket;
  player?: typeof Player;
}

export interface GuildPlayerState extends PlayerState {
  bands?: EqualizerBand
}

export interface PlayerData {
  guild: string;
  channel: string;
  node?: string;
}

export interface SocketData {
  address: string;
  port: string | number;
  password: string;
  name: string;
}

export interface WaitingPayload {
  res: (v: any) => any;
  rej: (error: Error) => any;
  payload: Record<string, any>;
}

export interface VoiceServer {
  token: string;
  guild_id: string;
  endpoint: string;
}

export interface VoiceState {
  channel_id?: string;
  guild_id: string;
  user_id: string;
  session_id: string;
  deaf?: boolean;
  mute?: boolean;
  self_deaf?: boolean;
  self_mute?: boolean;
  suppress?: boolean;
}

export abstract class Plugin {
  manager: Manager
  public abstract onLoad(): any;
  public abstract onNewSocket(_socket: Socket, _options: SocketData): any;
  public abstract onPlayerSummon(_player: Player): any;
}
