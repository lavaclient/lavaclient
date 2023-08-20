import type { LavalinkHTTPErrorReason } from "../error.js";
import type { ExecutedLavalinkRequest, PreparedLavalinkRequest } from "../request/index.js";

import type * as LP from "lavalink-protocol";

type HasRequest = {
    /**  */
    prepared: PreparedLavalinkRequest;
};

type Finished = ExecutedLavalinkRequest & {
    /** A request was made to Lavalink. */
    finished: true;
};

type DidNotFinish = HasRequest & {
    /** A request was made to Lavalink. */
    finished: false;
};

type Finish = Finished | DidNotFinish;

//
export type LavalinkAPIClientRequestEvent =
    | (Finished &
          (
              | {
                    /** The request was successful and lavalink handled it successfully. */
                    type: "success";
                }
              | {
                    /** The request was successful but lavalink encountered an exception while handling it. */
                    type: "fail";
                    /** The error that lavalink encountered. */
                    error: LP.Error;
                }
          ))
    | (Finish & {
          /** Something went wrong regardless of whether the request was successful or not. */
          type: "error";
          /** The reason we encountered an error. */
          reason: Exclude<LavalinkHTTPErrorReason, "UNKNOWN" | "LAVALINK">;
          /** The error that we encountered. */
          cause: unknown;
      });

export type LavalinkAPIClientStatistics = Record<"sent" | "failed" | "successful" | "errored" | "lastTook", number>;

export type LavalinkAPIClientEvents = {
    /** Emitted whenever a request is made to lavalink. */
    request: (event: LavalinkAPIClientRequestEvent) => void;
};

export interface LavalinkAPIClientOptions {
    /** The host to use. */
    host: string;

    /** The authentication to use for REST calls. */
    auth: string;

    /** The port to use, this is done automatically via {@link tls} if provided. Defaults to `80` */
    port?: number;

    /** Whether to enable TLS, this is done automatically based on the given {@link port} */
    tls?: boolean;

    /** Whether to enable traces for lavalink exceptions, defaults to `false`. */
    enableTrace?: boolean;

    /** The user-agent to use, defaults to `lavalink-api-client (npmjs.com/lavalink-api-client, node.js <NODEJS VERSION>)`. */
    userAgent?: string;

    /** The fetch implementation to use. */
    fetch?: (url: string | URL, init?: RequestInit) => Promise<Response>;
}
