import * as Protocol from "lavalink-protocol";
import * as PR from "@effect/schema/ParseResult";
import * as S from "@effect/schema/Schema";

export const audioLoadSearchResultType = S.literal("track", "album", "artist", "playlist", "text");

export const textObject = S.struct({
    text: S.string,
    plugin: S.record(S.string, S.unknown),
});

export const RESTGetLoadSearchQuery = S.struct({
    /**
     * The search query.
     */
    query: S.string,
    /**
     * The types to search for.
     */
    types: S.transformResult(
        S.string,
        S.array(audioLoadSearchResultType),
        (value) => S.parseResult(S.array(audioLoadSearchResultType))(value.split(",")),
        (value) => PR.success(value.join(",")),
    ),
});

export const RESTGetLoadSearchResult = S.struct({
    /**
     * An array of tracks, only populated if `track` was present in the types` param.
     */
    tracks: S.array(Protocol.track),
    /**
     * An array of albums, only populated if `album` was present in the types` param.
     */
    albums: S.array(Protocol.playlist),
    /**
     * An array of artists, only populated if `artist` was present in the types` param.
     */
    artists: S.array(Protocol.playlist),
    /**
     * An array of playlists, only populated if `playlist` was present in the types` param.
     */
    playlists: S.array(Protocol.playlist),
    /**
     * An array of text results, only populated if `text` was present in the types` param.
     */
    texts: S.array(textObject),
    /**
     * Additional result data provided by plugins
     */
    plugin: S.record(S.string, S.unknown),
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
};

export type AudioLoadSearchResultType = S.To<typeof audioLoadSearchResultType>;

export type RESTGetLoadSearchResult = S.To<typeof RESTGetLoadSearchResult>;

export type RESTGetLoadSearchQuery = S.To<typeof RESTGetLoadSearchQuery>;
