import * as Protocol from "lavalink-protocol";
import * as Schema from "effect/Schema";
import { pipe } from "effect";

export const audioLoadSearchResultType = Schema.Literal("track", "album", "artist", "playlist", "text");

export const textObject = Schema.Struct({
    text: Schema.String,
    plugin: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
});

export const RESTGetLoadSearchQuery = Schema.Struct({
    /**
     * The search query.
     */
    query: Schema.String,
    /**
     * The types to search for.
     */
    types: pipe(Schema.compose(Schema.split(","), Schema.Array(audioLoadSearchResultType)), Schema.asSchema),
});

export const RESTGetLoadSearchResult = Schema.Struct({
    /**
     * An array of tracks, only populated if `track` was present in the types` param.
     */
    tracks: Schema.Array(Protocol.track),
    /**
     * An array of albums, only populated if `album` was present in the types` param.
     */
    albums: Schema.Array(Protocol.playlist),
    /**
     * An array of artists, only populated if `artist` was present in the types` param.
     */
    artists: Schema.Array(Protocol.playlist),
    /**
     * An array of playlists, only populated if `playlist` was present in the types` param.
     */
    playlists: Schema.Array(Protocol.playlist),
    /**
     * An array of text results, only populated if `text` was present in the types` param.
     */
    texts: Schema.Array(textObject),
    /**
     * Additional result data provided by plugins
     */
    plugin: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
});

/**
 * An endpoint which is used to search for tracks, albums, artists, playlists & text.
 * @see https://github.com/topi314/LavaSearch/blob/master/README.md#api
 */
export const RESTGetLoadSearch = {
    method: "GET" as const,
    path: "/v4/loadsearch" as const,
    query: RESTGetLoadSearchQuery,
    result: RESTGetLoadSearchResult,
} as const;

export type AudioLoadSearchResultType = Schema.Schema.Type<typeof audioLoadSearchResultType>;

export type RESTGetLoadSearchResult = Schema.Schema.Type<typeof RESTGetLoadSearchResult>;

export type RESTGetLoadSearchQuery = Schema.Schema.Type<typeof RESTGetLoadSearchQuery>;
