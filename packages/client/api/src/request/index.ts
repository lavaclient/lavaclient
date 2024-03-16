export * from "./executor.js";
export * from "./tools.js";

export interface PreparedLavalinkHttpRequest {
    /** The {@link LavalinkHttpRequest Lavalink Request} that was given. */
    request: LavalinkHttpRequest;

    /**
     * The {@link RequestInit request options} that will be used.
     */
    init: RequestInit;

    /**
     * The URL to make a request to.
     */
    url: URL;
}

export type ExecutedLavalinkHttpRequest = {
    /** The prepared request. */
    prepared: PreparedLavalinkHttpRequest;

    /** How long the request took (in milliseconds). */
    took: number;

    /** The response. */
    response: Response;
};

export interface LavalinkHttpRequest {
    /** The endpoint to make a request to. */
    path: `/v4/${string}`;

    /** The HTTP method. */
    method: string;

    /** The body to use. */
    body?: BodyInit;

    /** Whether to enable traces for lavalink exceptions, defaults to `false`. */
    enableTrace?: boolean;

    /** Additional headers. */
    headers?: HeadersInit;

    /** Search parameters to use. */
    query?: URLSearchParams;

    /** Other request options to use, some fields may be overwritten by lavaclient. */
    other?: RequestInit;
}
