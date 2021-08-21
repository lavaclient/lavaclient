import type { SendGatewayPayload } from "./node/Node";

export type Snowflake = string;
export type DiscordResource = { id: Snowflake };
export type Dictionary<V = any, K extends string | symbol = string> = Record<K, V>;

export interface Manager {
}

export interface ManagerOptions {
    sendGatewayPayload: SendGatewayPayload;
    user?: Snowflake | DiscordResource;
}

export function getId(value: Snowflake | DiscordResource): Snowflake {
    return typeof value === "string" ? value : value.id;
}
