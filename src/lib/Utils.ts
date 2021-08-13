import { EventEmitter } from "events";
import type { Dictionary, DiscordResource, Snowflake } from "../constants";

/* typed emitter. */
export class Emitter<E extends Listeners> extends EventEmitter {}

type Listener<A extends Array<any> = any[]> = (...args: A) => void;
type Listeners = Dictionary<Listener, string | symbol>;

export interface Emitter<E extends Listeners> extends EventEmitter {
    on<K extends keyof E>(eventName: K, listener: E[K]): this;
    emit<K extends keyof E>(eventName: K, ...args: Parameters<E[K]>): boolean;
}

export function sleep(duration: number): Promise<void> {
    return new Promise<void>(res => setTimeout(res, duration));
}

export function getId(value: Snowflake | DiscordResource): Snowflake {
    return typeof value === "string" ? value : value.id;
}
