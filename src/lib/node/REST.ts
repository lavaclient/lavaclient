import fetch, { RequestInit } from "node-fetch";

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
        return this.do(`/decodetracks`, { method: "post", body: JSON.stringify(tracks) });
    }

    decodeTrack(track: string): Promise<TrackInfo> {
        return this.do(`/decodetrack?track=${track}`);
    }

    do<T>(endpoint: string, options: Omit<RequestInit, "headers"> = {}): Promise<T> {
        endpoint = /^\/.+/.test(endpoint) ? endpoint : `/${endpoint}`
        return fetch(`${this.baseUrl}${endpoint}`, { ...options, headers: { authorization: this.info.password } })
            .then(res => res.json())
            .finally(() => this.node.debug("rest", `${options.method?.toUpperCase() ?? "GET"} ${endpoint}`));
    }
}
