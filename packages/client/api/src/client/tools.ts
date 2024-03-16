import type { LavalinkHttpClient } from "./index.js";
import type { LavalinkHttpClientOptions, LavalinkHttpClientRequestEvent } from "./types.js";

/**
 * Get the user agent to use.
 *
 * @param options The options passed to the API Client.
 */
export const getUserAgent = (options: LavalinkHttpClientOptions) =>
    options.userAgent ?? `lavalink-api-client (npmjs.com/lavalink-api-client, Node.JS ${process.version})`;

/**
 * Get the port to use.
 *
 * @param options The options passed to the API Client.
 */
export const getPort = (options: LavalinkHttpClientOptions) => {
    return options.port ?? 80;
};

/**
 * Whether to use TLS.
 *
 * @param options The options passed to the API Client.
 */
export const isSecure = (options: LavalinkHttpClientOptions) => {
    return options.tls ?? getPort(options) === 443;
};

/**
 * The address to use for the API Client.
 *
 * @param options The options passed to the API Client.
 */
export const getAddress = (options: LavalinkHttpClientOptions) => {
    return `${options.host}:${getPort(options)}`;
};

/**
 * Create a URI.
 *
 * @param options The options passed to the API Client.
 */
export const getURI = (proto: string, options: LavalinkHttpClientOptions) => {
    return `${proto}${isSecure(options) ? "s" : ""}://${getAddress(options)}`;
};

export const onRequest = (client: LavalinkHttpClient, event: LavalinkHttpClientRequestEvent) => {
    // update statistics.
    client.statistics.sent++;

    switch (event.type) {
        case "error":
            client.statistics.errored++;
            break;
        case "fail":
            client.statistics.failed++;
            break;
        case "success":
            client.statistics.successful++;
            break;
    }

    if (event.finished) {
        client.statistics.lastTook = event.took;
    }

    // if someone is listening to the `request` event then emit it.
    if (client.listenerCount("request") > 0) client.emit("request", event);
};
