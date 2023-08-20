import EventEmitter from "events";
import type { EventMap, default as TypedEmitter } from "typed-emitter";

export const Emitter = EventEmitter as { new <T extends EventMap>(): TypedEmitter<T> };

export type Snowflake = string;

export interface DiscordResource {
    id: Snowflake;
}

export function getId(value: Snowflake | DiscordResource): Snowflake {
    return typeof value === "string" ? value : value.id;
}
