import fetch from "centra";

import type * as Lavalink from "@lavaclient/types";
import type { Node } from "./Node";

export class REST {
    constructor(readonly node: Node) {
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

    decodeTracks(...tracks: string[]): Promise<Lavalink.TrackInfo[]> {
        return this.do("/decodetracks", { method: "post", data: JSON.stringify(tracks) });
    }

    decodeTrack(track: string): Promise<Lavalink.TrackInfo> {
        return this.do(`/decodetrack?track=${track}`);
    }

    do<T>(endpoint: string, options: Options = {}): Promise<T> {
        endpoint = /^\/.+/.test(endpoint) ? endpoint : `/${endpoint}`;
        const req = fetch(`${this.baseUrl}${endpoint}`, options.method ?? "GET")
            .header("Authorization", this.info.password);

        if (options.data) {
            req.body(options.data, "json");
        }

        return req.send()
            .then(r => r.json())
            .finally(() => this.node.debug("rest", `${options.method?.toUpperCase() ?? "GET"} ${endpoint}`));
    }
}

export type Options = { method?: string, data?: any }
