import { LavalinkAPIClient } from "lavalink-api-client";
import { Client } from "./client";
import { Player } from "./player";
import { PlayerManager } from "./players";

export class Cluster implements Client {
    players!: PlayerManager;

    get userId(): string | undefined {
        throw new Error("Method not implemented.");
    }

    get rest(): LavalinkAPIClient {
        throw new Error("Method not implemented.");
    }

    connect(userId: string): void {
        void userId;
        throw new Error("Method not implemented.");
    }

    disconnect(): void {
        throw new Error("Method not implemented.");
    }

    createPlayer(guildId: string): Player {
        void guildId;
        throw new Error("Method not implemented.");
    }
}
