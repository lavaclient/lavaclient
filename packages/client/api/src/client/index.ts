import EventEmitter from "events";
import type { EventMap, default as TypedEmitter } from "typed-emitter";

const Emitter = EventEmitter as { new <T extends EventMap>(): TypedEmitter<T> };

//
import { LavalinkAPIRequest } from "../request/index.js";
import { execute } from "../request/executor.js";
import { prepare } from "../request/tools.js";

//
import type { LavalinkAPIClientEvents, LavalinkAPIClientOptions, LavalinkAPIClientStatistics } from "./types.js";
export type * from "./types.js";

//
import { onRequest } from "./tools.js";
export * from "./tools.js";

export class LavalinkAPIClient extends Emitter<LavalinkAPIClientEvents> {
    readonly statistics: LavalinkAPIClientStatistics = {
        errored: 0,
        failed: 0,
        sent: 0,
        successful: 0,
        lastTook: -1,
    };

    constructor(readonly options: LavalinkAPIClientOptions) {
        super();
    }

    // TODO: penalty calculation for easier load-balancing.

    /**
     * Execute a {@link LavalinkAPIRequest}. This method wil only throw 2 exceptions:
     * - {@link LavalinkHTTPError}: Indicates that something went wrong while executing the request or handling the response.
     * - {@link LavalinkAPIError}: Indicates that lavalink encountered an exception while handling the request.
     */
    async execute(request: LavalinkAPIRequest) {
        /* execute the prepared request. */
        const executed = await execute(this, prepare(this, request));
        onRequest(this, {
            type: "success",
            finished: true,
            ...executed,
        });

        /* if not then return the response. */
        return executed.response;
    }
}
