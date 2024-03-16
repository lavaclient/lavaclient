import * as LP from "lavalink-protocol";

import { SessionAPI } from "./session.js";
import { executeDeletePlayer, executeGetSessionPlayer, executeUpdatePlayer } from "../endpoint/index.js";
import { isNotFoundError } from "../error.js";

export class PlayerAPI {
    constructor(
        readonly session: SessionAPI,
        readonly id: string,
    ) {}

    private get path() {
        return { sessionId: this.session.id, guildId: this.id };
    }

    get client() {
        return this.session.client;
    }

    /**
     * Fetches the player data from the API, this method will throw if it doesn't exist.
     * If you just want to check if the player exists, use {@link fetchOrNull} instead.
     *
     * @returns The player data.
     */
    fetch() {
        return executeGetSessionPlayer(this.client, { path: this.path });
    }

    /**
     * Fetches the player data from the API, this method will return `null` if it doesn't exist.
     *
     * @returns The player data or `null` if it doesn't exist.
     */
    async fetchOrNull() {
        try {
            return await this.fetch();
        } catch (ex) {
            if (isNotFoundError(ex)) return null;
            throw ex;
        }
    }

    /**
     * Update this player with the provided {@link body data}.
     *
     * @param body The data to update the player with.
     * @param noReplace If you do not want the current playing track to get replaced provide `true`.
     * @returns The new player data.
     */
    update(body: LP.RESTPatchAPIPlayerJSONBody, noReplace = false) {
        return executeUpdatePlayer(this.client, {
            body,
            path: this.path,
            query: { noReplace },
        });
    }

    /**
     * Delete this player, this method will throw if it doesn't exist.
     * If you just want to delete the player if it exists, use {@link remove} instead.
     */
    delete() {
        return executeDeletePlayer(this.client, { path: this.path });
    }

    /**
     * Attempts to delete this player.
     *
     * @returns `true` if the player was deleted, `false` if it didn't exist.
     */
    async remove() {
        try {
            await this.delete();
            return true;
        } catch (ex) {
            if (isNotFoundError(ex)) return false;
            throw ex;
        }
    }
}
