import type { LavalinkAPIRequest, PreparedLavalinkRequest } from "./index.js";
import { getUserAgent, type LavalinkAPIClientOptions, type LavalinkAPIClient, getURI } from "../client/index.js";

/**
 * Get the URL to use in the prepared request.
 *
 * @param request The request to get the URL for.
 * @param options The options passed to the API Client.
 */
export const getRequestURL = (request: LavalinkAPIRequest, options: LavalinkAPIClientOptions): URL => {
    const url = new URL(request.path, getURI("http", options));

    // append all of the configured search params to the url.
    if (request.query)
        for (const [k, v] of request.query) {
            url.searchParams.append(k, v);
        }

    // check if we should enable exception traces.
    const trace = request.enableTrace ?? options.enableTrace;
    if (trace) {
        url.searchParams.set("trace", `${trace}`);
    }

    return url;
};

/**
 * Get the request init to use in the prepared request.
 *
 * @param request The request to get the request init for.
 * @param options The options passed to the API Client.
 */
export const getRequestInit = (request: LavalinkAPIRequest, options: LavalinkAPIClientOptions): RequestInit => {
    /*
     * Construct the headers to use.
     */
    const headers = new Headers(request.headers);
    headers.set("Authorization", options.auth);
    headers.set("User-Agent", getUserAgent(options));

    /*
     * Create request init object.
     */
    const init: RequestInit = {
        ...request.other,
        method: request.method,
        keepalive: true,
        headers,
    };

    if ("body" in request) {
        init.body = request.body;
    }

    return init;
};

export const prepare = (client: LavalinkAPIClient, request: LavalinkAPIRequest): PreparedLavalinkRequest => {
    const url = getRequestURL(request, client.options),
        init = getRequestInit(request, client.options);

    return { request, init, url };
};
