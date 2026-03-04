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

import * as Protocol from "lavalink-protocol";
import * as S from "@effect/schema/Schema";

export type Snowflake = string;

export interface DiscordResource {
    id: Snowflake;
}

export type Identifiable = Snowflake | DiscordResource;

export function getId(value: Identifiable): Snowflake {
    return typeof value === "string" ? value : value.id;
}

export { S };

/**
 * Get the user data from a track.
 *
 * @param track  The track to get the user data from
 * @param schema The schema to parse the user data with
 * @returns     The parsed user data
 */
export function getUserData<T>(track: Protocol.Track, schema: Protocol.AnySchema<T>): T | null {
    if (!track.userData) return null;
    return Protocol.parse(schema, track.userData);
}
