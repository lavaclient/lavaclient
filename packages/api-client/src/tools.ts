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
