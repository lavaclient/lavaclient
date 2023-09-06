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

import * as TF from "@effect/schema/TreeFormatter";
import * as PR from "@effect/schema/ParseResult";
import * as S from "@effect/schema/Schema";

export class SchemaError extends Error {
    constructor(message: string, errors: readonly [PR.ParseErrors, ...PR.ParseErrors[]]) {
        super(TF.formatErrors(errors), { cause: message });
    }
}

export const encodeSchema = <I, A>(schema: S.Schema<I, A>, value: A) => {
    const parsed = S.encodeEither(schema)(value);
    if (parsed._tag === "Left") throw new SchemaError("Unable to encode value.", parsed.left.errors);
    return parsed.right;
};

export const parseSchema = <I, A>(schema: S.Schema<I, A>, value: unknown) => {
    const parsed = S.parseEither(schema)(value);
    if (parsed._tag === "Left") throw new SchemaError("Unable to parse value.", parsed.left.errors);
    return parsed.right;
};
