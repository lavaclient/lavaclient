import { PlayTrack } from "@kyflx-dev/lavalink-types";
import { Manager } from "./Manager";
import { Player } from "./Player";
import { Socket } from "./Socket";

/** Interfaces */

export type SendFunction = (guildId: string, payload: any) => any;
export type PlayOptions = Partial<Omit<PlayTrack, "op" | "guildId" | "track">>;

export interface ManagerOptions {
  send: SendFunction;
  shards?: number;
  userId?: string;
  socketDefaults?: SocketOptions;
}

export interface SocketData {
  host: string;
  port: string | number;
  password: string;
  id: string;
  options?: SocketOptions;
}

export interface SocketOptions {
  retryDelay?: number;
  maxTries?: number;
  resumeKey?: string;
  resumeTimeout?: number;
}

export interface WaitingPayload {
  res: (v: any) => any;
  rej: (error: Error) => any;
  data: Record<string, any>;
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

export interface PlayerData {
  guild: string;
  channel: string;
  node?: string;
}

export interface ConnectOptions {
  deaf?: boolean;
  mute?: boolean;
}

/** Plugin */

export abstract class Plugin {
  public manager: Manager;

  public preRegister(): void {
    return;
  }

  public register(manager: Manager): void {
    this.manager = manager;
  }
}

/** Extending Stuff */

export interface Extendables {
  socket: typeof Socket;
  player: typeof Player;
}

export class Structures {
  public static extendables: Extendables = {
    player: Player,
    socket: Socket,
  };

  public static extend<K extends keyof Extendables, E extends Extendables[K]>(
    name: K,
    extend: (base: Extendables[K]) => E
  ): E {
    const extended = extend(this.extendables[name]);
    return (this.extendables[name] = extended);
  }

  public static get<K extends keyof Extendables>(name: K): Extendables[K] {
    return this.extendables[name];
  }
}

export function Extend<K extends keyof Extendables>(name: K) {
  return <T extends Extendables[K]>(target: T): T => {
    return Structures.extend(name, () => target);
  };
}
