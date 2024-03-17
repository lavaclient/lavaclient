/*
 * Copyright 2023 Dimensional Fun & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as LP from "lavalink-protocol";

import { LavalinkHTTPError } from "../error.js";
import { LavalinkHttpRequest, prepare, execute } from "../request/index.js";
import { LavalinkHttpClient, LavalinkHttpClientRequestEvent, onRequest } from "../client/index.js";

export const createEndpointMethod =
    <E extends EndpointDefinition>(def: E): createExecuteEndpointFn<E> =>
    async (client, arg1, arg2 = {}) => {
        /* build the request object. */
        const request: LavalinkHttpRequest = {
            ...arg2,
            method: def.method,
            // @ts-expect-error
            path: def.path.replaceAll(/\[(?<key>\w+)\]/g, (_, key) => arg1.path?.[key]),
        };

        const headers = new Headers(request.headers);

        // if the endpoint has query parameters then set them.
        if (def.query && "query" in arg1 && arg1.query)
            try {
                request.query = new URLSearchParams(LP.encode(def.query, arg1.query));
            } catch (cause) {
                onRequest(client, {
                    type: "error",
                    finished: false,
                    reason: "VALIDATION",
                    cause,
                    prepared: prepare(client, request),
                });

                throw new LavalinkHTTPError("Unable to encode request body", { cause, reason: "VALIDATION" });
            }

        // if the endpoint has a body then encode it.
        if (def.jsonBody && "body" in arg1 && arg1.body) {
            try {
                request.body = JSON.stringify(LP.encode(def.jsonBody, arg1.body));
            } catch (cause) {
                onRequest(client, {
                    type: "error",
                    finished: false,
                    reason: "VALIDATION",
                    cause,
                    prepared: prepare(client, request),
                });

                throw new LavalinkHTTPError("Unable to encode request body", { cause, reason: "VALIDATION" });
            }

            headers.set("Content-Type", "application/json; charset=utf-8");
        }

        // if the endpoint has a result then set an `Accept` header.
        if ("result" in def) {
            headers.set("Accept", "application/json; charset=utf-8");
        }

        request.headers = headers;

        /* execute the request. */
        const executed = await execute(client, prepare(client, request));

        // if the endpoint has a result then parse it.
        if (def.result) {
            let data = null;
            try {
                data = await executed.response.json();
            } catch (cause) {
                onRequest(client, {
                    type: "error",
                    finished: true,
                    reason: "DECODE",
                    cause,
                    ...executed,
                });

                throw new LavalinkHTTPError("Unable to decode JSON response", { cause, reason: "DECODE" });
            }

            let reason: unknown = null;
            try {
                return LP.parse(def.result, data);
            } catch (cause) {
                reason = cause;
                throw new LavalinkHTTPError("Unable to validate JSON response", { cause, reason: "VALIDATION" });
            } finally {
                const event: LavalinkHttpClientRequestEvent = reason
                    ? { type: "error", finished: true, reason: "VALIDATION", cause: reason, ...executed }
                    : { type: "success", finished: true, ...executed };

                onRequest(client, event);
            }
        }

        onRequest(client, { type: "success", finished: true, ...executed });
    };

interface ResultContainer<T> {
    result: LP.AnySchema<T>;
}

interface JSONBodyContainer<T> {
    jsonBody: LP.AnySchema<T>;
}

interface QueryContainer<T> {
    query: LP.AnySchema<T>;
}

interface PathContainer<P extends string> {
    path: P;
}

type EndpointDefinition = Partial<ResultContainer<any> & JSONBodyContainer<any> & QueryContainer<any>> &
    PathContainer<string> & {
        method: "GET" | "DELETE" | "POST" | "PATCH";
    };

type IsParameter<Part extends string> = Part extends `[${infer ParamName}]` ? ParamName : never;

type FilteredParts<Path extends string> = Path extends `${infer PartA}/${infer PartB}`
    ? IsParameter<PartA> | FilteredParts<PartB>
    : IsParameter<Path>;

type RemovePrefixDots<Key extends string> = Key extends `...${infer Name}` ? Name : Key;

type Params<Path extends string> = {
    [Key in FilteredParts<Path> as RemovePrefixDots<Key>]: Key extends `...${string}` ? string[] : string;
};

type CreatePathArguments<E extends EndpointDefinition> = E extends PathContainer<infer Path> ? Params<Path> : {};

type EmptyObject = Record<PropertyKey, never>;

type AddPath<E extends EndpointDefinition, R extends object> = CreatePathArguments<E> extends EmptyObject
    ? R
    : R & { path: CreatePathArguments<E> };

type createEndpointMethodArgs<E extends EndpointDefinition> = E extends JSONBodyContainer<infer Body>
    ? E extends QueryContainer<infer QP>
        ? { body: Body; query: QP }
        : { body: Body }
    : E extends QueryContainer<infer QP>
    ? { query: QP }
    : {};

type createExecuteEndpointFn<E extends EndpointDefinition> = (
    client: LavalinkHttpClient,
    request: AddPath<E, createEndpointMethodArgs<E>>,
    options?: Omit<LavalinkHttpRequest, "path" | "method" | "query" | "body">,
) => Promise<E extends ResultContainer<infer Result> ? Result : void>;
