import phin from "phin";

import type { LoadTracksResponse, TrackInfo } from "@lavaclient/types";
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

    loadTracks(identifier: string): Promise<LoadTracksResponse> {
        return this.do(`/loadtracks?identifier=${encodeURIComponent(identifier)}`);
    }

    decodeTracks(...tracks: string[]): Promise<TrackInfo[]> {
        return this.do(`/decodetracks`, { method: "post", data: JSON.stringify(tracks) });
    }

    decodeTrack(track: string): Promise<TrackInfo> {
        return this.do(`/decodetrack?track=${track}`);
    }

    do<T>(endpoint: string, options: Options = {}): Promise<T> {
        endpoint = /^\/.+/.test(endpoint) ? endpoint : `/${endpoint}`
        return phin<T>({
            url: `${this.baseUrl}${endpoint}`,
            parse: "json",
            headers: { authorization: this.info.password },
            ...options
        })
            .then(res => res.body)
            .finally(() => this.node.debug("rest", `${options.method?.toUpperCase() ?? "GET"} ${endpoint}`));
    }
}

export type Options = Partial<Omit<phin.IWithData<phin.IOptions>, "url" | "headers" | "parse">>
