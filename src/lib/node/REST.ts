// noinspection JSUnusedGlobalSymbols

import { Dispatcher, Pool } from "undici";

import type * as Lavalink from "@lavaclient/types/v3";
import type { Node } from "./Node";

export class REST {
    readonly pool: Pool;

    constructor(readonly node: Node) {
        this.pool = new Pool(this.baseUrl);
    }

    private get info() {
        return this.node.conn.info;
    }

    get baseUrl(): string {
        return `http${this.info.secure ? "s" : ""}://${this.info.host}:${this.info.port}`;
    }

    loadTracks(identifier: string): Promise<Lavalink.LoadTracksResponse> {
        return this.do(`/loadtracks?identifier=${encodeURIComponent(identifier)}`);
    }

    decodeTracks(...tracks: string[]): Promise<Lavalink.DecodeTracksResponse> {
        return this.do("/decodetracks", { method: "POST", data: tracks });
    }

    decodeTrack(track: string): Promise<Lavalink.DecodeTrackResponse> {
        return this.do(`/decodetrack?track=${track}`);
    }

    async do<T>(
        endpoint: string,
        { method = "GET", data }: Options = {},
    ): Promise<T> {
        endpoint = /^\/.+/.test(endpoint) ? endpoint : `/${endpoint}`;

        try {
            const request = await this.pool.request({
                path: endpoint,
                method: method,
                body: data ? JSON.stringify(data) : undefined,
                headers: {
                    "Authorization": this.info.password,
                    "Client-Name": this.node.conn.clientName,
                },
            });

            this.node.debug("rest", `+ ${method} ${endpoint}`);
            return await request.body.json();
        } catch (e) {
            this.node.emit("error", e instanceof Error ? e : new Error(`${e}`));
            this.node.debug("rest", `- ${method} ${endpoint}`);
            throw e;
        }
    }
}

export interface Options {
    method?: Dispatcher.HttpMethod;
    data?: any;
}
