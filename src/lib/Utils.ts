import { EventEmitter } from "events";

export type Snowflake = string;
export type DiscordResource = { id: Snowflake };
export type Dictionary<V = any, K extends string | number | symbol = string> = Record<K, V>;

/* typed emitter. */
export class Emitter<E extends Listeners> extends EventEmitter {}

type Listener<A extends Array<any> = any[]> = (...args: A) => void;
type Listeners = Dictionary<Listener, string | symbol>;

export interface Emitter<E extends Listeners> extends EventEmitter {
    on<K extends keyof E>(eventName: K, listener: E[K]): this;
    emit<K extends keyof E>(eventName: K, ...args: Parameters<E[K]>): boolean;
}

/**
 * @internal
 */
export function getId(value: Snowflake | DiscordResource): Snowflake {
    return typeof value === "string" ? value : value.id;
}
