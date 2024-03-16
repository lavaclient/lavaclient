import * as LP from "lavalink-protocol";

import { PlayerAPI } from "./player.js";
import { LavalinkAPI } from "./root.js";
import { executeGetSessionPlayers, executeUpdateSession } from "../endpoint/index.js";

export class SessionAPI {
    constructor(
        readonly lavalink: LavalinkAPI,
        readonly id: string,
    ) {}

    private get path() {
        return { sessionId: this.id };
    }

    get client() {
        return this.lavalink.client;
    }

    /**
     * Create an API for the given {@link id guild id}.
     *
     * @param id ID of the player.
     * @returns The created {@link PlayerAPI}
     */
    player(id: string) {
        return new PlayerAPI(this, id);
    }

    /**
     * Update this session with the provided {@link body data}.
     *
     * @param body The data to update the session with.
     * @returns The new session data.
     */
    update(body: LP.RESTPatchAPISessionJSONBody) {
        return executeUpdateSession(this.client, { path: this.path, body });
    }

    /**
     * All of the players created by this session.
     *
     * @returns All of the players created by this session.
     */
    players() {
        return executeGetSessionPlayers(this.client, { path: this.path });
    }
}
