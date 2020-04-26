export * from "./Manager";
export { default as Player, ConnectOptions, PlayOptions } from "./Player";
export { default as Socket, SocketOptions } from "./Socket";
export * from "./Plugin";

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
