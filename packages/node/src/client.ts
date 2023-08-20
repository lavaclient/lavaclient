import { LavalinkAPIClient } from "lavalink-api-client";
import { PlayerManager } from "./players.js";
import { Player } from "./player.js";

// TODO: events

export interface Client {
    /**
     * The player manager for this Client.
     */
    readonly players: PlayerManager;

    /**
     * The user id that is being authenticated with.
     */
    get userId(): string | undefined;

    /**
     * The Lavalink API client for this node. Depending on the implementation of this interface, this may not always return the same instance.
     */
    get rest(): LavalinkAPIClient;

    /**
     * Connects this Client to the lavalink node(s).
     *
     * @param userId The user id to authenticate with.
     */
    connect(userId: string): void;

    /**
     * Disconnects this Client from the lavalink node(s).
     */
    disconnect(): void;

    /**
     * Creates a new player for the given {@link guildId}
     * **Warning:** This is an internal method, and should not be used by users.
     *
     * @internal
     */
    createPlayer(guildId: string): Player;
}
