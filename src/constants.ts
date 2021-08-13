export type Snowflake = string;
export type DiscordResource = { id: Snowflake };
export type Dictionary<V = any, K extends string | number | symbol = string> = Record<K, V>;
