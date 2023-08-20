export * from "./executor.js";
export * from "./tools.js";

export interface PreparedLavalinkRequest {
    /** The {@link LavalinkAPIRequest Lavalink Request} that was given. */
    request: LavalinkAPIRequest;

    /**
     * The {@link RequestInit request options} that will be used.
     */
    init: RequestInit;

    /**
     * The URL to make a request to.
     */
    url: URL;
}

export type ExecutedLavalinkRequest = {
    /** The prepared request. */
    prepared: PreparedLavalinkRequest;

    /** How long the request took (in milliseconds). */
    took: number;

    /** The response. */
    response: Response;
};

export interface LavalinkAPIRequest {
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
