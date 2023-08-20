import type { ExecutedLavalinkRequest, PreparedLavalinkRequest } from "./index.js";
import type { LavalinkAPIClient } from "../client/index.js";

import * as LP from "lavalink-protocol";

import { LavalinkAPIError, LavalinkHTTPError } from "../error.js";
import { parseSchema } from "../tools.js";
import { onRequest } from "../client/tools.js";

export async function execute(
    client: LavalinkAPIClient,
    prepared: PreparedLavalinkRequest,
): Promise<ExecutedLavalinkRequest> {
    const start = performance.now();

    /* execute the request. */
    let response: Response;
    try {
        const fetch = client.options.fetch ?? globalThis.fetch;

        response = await fetch(prepared.url, prepared.init);
    } catch (cause) {
        // TODO: is there an error we can check for instead? or is this better?
        const reason = prepared.init.signal?.aborted ? "ABORTED" : "HTTP";

        onRequest(client, {
            type: "error",
            finished: false,
            reason,
            cause,
            prepared,
        });

        throw new LavalinkHTTPError("Something went wrong while executing the request.", { cause, reason: "HTTP" });
    }

    const executed = { prepared, response, took: performance.now() - start };

    /* check if there was an error. */
    if (response.status >= 300) {
        // decode json response.
        let data: unknown;
        try {
            data = await response.json();
        } catch (cause) {
            onRequest(client, {
                type: "error",
                finished: true,
                reason: "DECODE",
                cause,
                ...executed,
            });

            throw new LavalinkHTTPError("Couldn't parse JSON response", { cause, reason: "DECODE" });
        }

        // parse json response.
        let error: LP.Error;
        try {
            error = parseSchema(LP.error, data);
        } catch (cause) {
            onRequest(client, {
                type: "error",
                finished: true,
                reason: "VALIDATION",
                cause,
                ...executed,
            });

            throw new LavalinkHTTPError("Unable to parse error response", { cause, reason: "VALIDATION" });
        }

        onRequest(client, {
            type: "fail",
            finished: true,
            error,
            ...executed,
        });

        throw new LavalinkAPIError(error);
    }

    return executed;
}
