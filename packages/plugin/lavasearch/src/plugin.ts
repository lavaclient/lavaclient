import { executeLoadSearch } from "./endpoint.js";
import type * as Protocol from "./protocol.js";
import * as API from "lavalink-api-client";

type LoadType = Protocol.AudioLoadSearchResultType;

export const load = () => {
    Reflect.defineProperty(API.LavalinkAPI.prototype, "loadSearch", {
        value<T extends LoadType>(this: API.LavalinkAPI, query: string, type: T, ...types: Exclude<LoadType, T>[]) {
            return executeLoadSearch(this.client, {
                query: {
                    query,
                    types: [type, ...types],
                },
            });
        },
    });

    Reflect.defineProperty(API.LavalinkAPI.prototype, "loadSearchOrNull", {
        value<T extends LoadType>(this: API.LavalinkAPI, query: string, type: T, ...types: Exclude<LoadType, T>[]) {
            try {
                this.loadSearch(query, type, ...types);
            } catch (ex) {
                if (API.isNotFoundError(ex)) return null;
                throw ex;
            }
        },
    });
};

declare module "lavalink-api-client" {
    interface LavalinkAPI {
        /**
         * Perform a LavaSearch query, this method will throw if nothing was found.
         * @param query The search query.
         */
        loadSearch<T extends Protocol.AudioLoadSearchResultType>(
            query: string,
            type: T,
            ...types: Exclude<Protocol.AudioLoadSearchResultType, T>[]
        ): Promise<Protocol.RESTGetLoadSearchResult>;

        /**
         * Perform a LavaSearch query, or return `null` if nothing was found.
         * @param query The search query.
         */
        loadSearchOrNull<T extends Protocol.AudioLoadSearchResultType>(
            query: string,
            type: T,
            ...types: Exclude<Protocol.AudioLoadSearchResultType, T>[]
        ): Promise<Protocol.RESTGetLoadSearchResult | null>;
    }
}
