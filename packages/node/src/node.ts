import { LavalinkAPI, LavalinkAPIClient, LavalinkAPIClientOptions } from "lavalink-api-client";
import { LavalinkWSClient, LavalinkWSClientEvents, LavalinkWSClientOptions } from "lavalink-ws-client";
import { Emitter } from "./tools.js";
import { Client } from "./client.js";
import { Player } from "./player.js";
import { NodePlayerManager, PlayerManager } from "./players.js";

export class Node extends Emitter<NodeEvents> implements Client {
    /**
     * The player manager for this node.
     */
    readonly players: PlayerManager;

    /**
     * The Lavalink API client for this node.
     */
    readonly rest: LavalinkAPIClient;

    /**
     * The Lavalink WS client for this node.
     */
    readonly ws: LavalinkWSClient;

    userId: string | undefined;

    constructor(readonly options: NodeOptions) {
        super();

        this.players = new NodePlayerManager(this);
        this.rest = new LavalinkAPIClient({ ...options.info, ...options.rest });
        this.ws = new LavalinkWSClient(this.api, { ...options.info, userId: options.discord.userId });
        this.userId = options.discord.userId;

        // attach event listeners.
        this.ws.on("debug", (message) => this.emit("debug", { system: "ws", message }));
        this.ws.on("error", (error) => this.emit("error", error));

        this.ws.on("message", (message) => {
            if (message.op === "event") {
                this.players.resolve(message.guildId)?.handleEvent(message);
            } else if (message.op === "playerUpdate") {
                this.players.resolve(message.guildId)?.patchWithState(message.state);
            }
        });
    }

    /**
     * The entrypoint for most user-land API calls.
     */
    get api(): LavalinkAPI {
        return new LavalinkAPI(this.rest);
    }

    /**
     * Connects to the lavalink node.
     *
     * @param userId The user id to authenticate with.
     */
    connect(userId?: string) {
        if (userId) this.userId = userId;
        this.ws.connect(userId);
    }

    /**
     * Disconnects from the lavalink node.
     */
    disconnect(): void {
        this.ws.disconnect();
    }

    /**
     * @internal
     */
    createPlayer(guildId: string): Player {
        return new Player(this, guildId);
    }
}

export type NodeDebugEvent = {
    message: string;
} & (
    | {
          system: "ws" | "rest";
      }
    | {
          system: "player";
          subsystem: "voice" | "track" | "event";
          player: Player;
      }
);

export type NodeEvents = Omit<LavalinkWSClientEvents, "debug"> & {
    /** Emitted when a debug message is logged */
    debug: (event: NodeDebugEvent) => void;
};

type InfoKeys = "host" | "port" | "tls" | "auth";

export interface NodeDiscordOptions {
    /**
     * The user id to authenticate with.
     */
    userId?: string;

    /**
     * A method used to send gateway commands to Discord.
     */
    sendGatewayCommand: (guildId: string, data: unknown) => void;
}

export type NodeOptions = {
    /**
     * Crucial information about the node.
     */
    info: Pick<LavalinkAPIClientOptions, InfoKeys>;

    /**
     * Options for Discord.
     */
    discord: NodeDiscordOptions;

    /**
     * Options to pass to the Lavalink API client.
     */
    rest?: Omit<LavalinkAPIClientOptions, InfoKeys>;

    /**
     * Options to pass to the Lavalink WS client.
     */
    ws?: Omit<LavalinkWSClientOptions, "userId">;
};
