import type { Player, VoiceServerUpdate, VoiceStateUpdate } from "./Player";
import type { REST } from "./node/REST";
import type { SendGatewayPayload } from "./node/Node";

export type Snowflake = string;
export type DiscordResource = { id: Snowflake };
export type Dictionary<V = any, K extends string | symbol = string> = Record<K, V>;

export interface Manager {
    readonly rest: REST;
    readonly sendGatewayPayload: SendGatewayPayload;

    userId?: Snowflake;

    connect(user?: Snowflake | DiscordResource): void;
    createPlayer(guild: Snowflake | DiscordResource): Player;
    destroyPlayer(guild: Snowflake | DiscordResource): boolean;
    handleVoiceUpdate(update: VoiceStateUpdate | VoiceServerUpdate): void;
}

export interface ManagerOptions {
    sendGatewayPayload: SendGatewayPayload;
    user?: Snowflake | DiscordResource;
}

export function getId(value: Snowflake | DiscordResource): Snowflake {
    return typeof value === "string" ? value : value.id;
}
