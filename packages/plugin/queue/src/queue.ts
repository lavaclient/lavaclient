import { mayStartNext, type Track } from "lavalink-protocol";
import { type DiscordResource, type NodeEvents, type Player, type Snowflake, getId } from "lavaclient";
import { TypedEmitter } from "tiny-typed-emitter";

export enum LoopType {
    None,
    Queue,
    Song,
}

export interface Song extends Track {
    requesterId?: string;
}

export interface QueueOptions {
    play: (queue: Queue, song: Song) => Promise<void>;
}

export class Queue extends TypedEmitter<QueueEvents> {
    tracks: Song[] = [];
    previous: Song[] = [];
    loop: Loop = { type: LoopType.None, current: 0, max: -1 };
    last: Song | null = null;
    current: Song | null = null;
    data: Record<string, any> = {};

    constructor(
        readonly player: Player,
        readonly options: QueueOptions,
    ) {
        super();

        player.on("trackStart", () => {
            if (!this.current) {
                /* shouldn't really happen but oh well. */
                return;
            }

            if (this.loop.type === LoopType.Song && this.current === this.last) {
                this.loop.current++;
            }

            this.emit("trackStart", this.current);
        });

        player.on("trackEnd", async (_, reason) => {
            if (!mayStartNext[reason]) {
                return;
            }

            this.last = this.current;
            if (this.current) {
                switch (this.loop.type) {
                    case LoopType.Song:
                        await this.options.play(this, this.current);
                        return;
                    case LoopType.Queue:
                        this.previous.push(this.current);
                        break;
                    case LoopType.None:
                        break;
                }

                this.emit("trackEnd", this.current);
            }

            if (!this.tracks.length) {
                this.tracks = this.previous;
                this.previous = [];
            }

            await this.next();
        });
    }

    async skip(): Promise<Song | null> {
        await this.player.stop();
        return this.current;
    }

    async start(): Promise<boolean> {
        return this.next();
    }

    async next(): Promise<boolean> {
        const next = this.tracks.shift();
        if (!next) {
            this.emit("finish");
            return false;
        }

        this.current = next;
        await this.options.play(this, next);
        return true;
    }

    clear(): void {
        this.tracks = [];
    }

    remove(song: Song): Song | null;

    remove(index: number): Song | null;

    remove(song: Song | number): Song | null {
        if (typeof song === "number") {
            if (song < 0 || song >= this.tracks.length) {
                /* maybe we should throw an exception? */
                return null;
            }

            return this.tracks.splice(song, 1)[0] ?? null;
        }

        const index = this.tracks.indexOf(song);
        if (index !== -1) {
            /* maybe we should throw an exception? */
            return null;
        }

        return this.tracks.splice(index, 1)[0] ?? null;
    }

    override emit<U extends keyof QueueEvents>(event: U, ...args: Parameters<QueueEvents[U]>): boolean {
        const _event: keyof NodeEvents = event === "finish" ? "queueFinish" : event;

        // @ts-expect-error
        this.player.node.emit(_event, this, ...args);
        return super.emit(event, ...args);
    }

    add(songs: Addable | Array<Addable>, options: AddOptions = {}): number {
        songs = Array.isArray(songs) ? songs : [songs];
        const requesterId = options.requester && getId(options.requester),
            toAdd = songs.map((song) => ({ ...song, requesterId }));

        this.tracks[options.next ? "unshift" : "push"](...toAdd);
        return this.tracks.length;
    }

    setLoop(type: LoopType, max = this.loop.max): this {
        this.loop.type = type;
        this.loop.max = max;

        return this;
    }

    sort(predicate?: (a: Song, b: Song) => number): Array<Song> {
        return this.tracks.sort(predicate);
    }

    shuffle(): void {
        for (let i = this.tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
        }
    }

    /* context stuff */

    set<T extends Record<string, any>>(data?: T): void;

    set<T>(key: string, value: T): void;

    set(p1: string | any, p2?: any): void {
        if (typeof p1 !== "string") {
            this.data = p1;
            return;
        }

        if (p2 != null) {
            this.data[p1] = p2;
        }
    }

    get<T extends Record<string, any>>(): T;

    get<T>(key: string): T | null;

    get(key?: string | any): any {
        return key ? this.data[key] : this.data;
    }
}

export type Addable = Track | Song;

export type QueueEvents = {
    trackStart: (song: Song) => void;
    trackEnd: (song: Song) => void;
    finish: () => void;
};

export interface Loop {
    type: LoopType;
    current: number;
    max: number;
}

export interface AddOptions {
    requester?: Snowflake | DiscordResource;
    next?: boolean;
}
