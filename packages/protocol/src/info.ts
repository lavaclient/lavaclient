import { Schema as S } from "effect";

/**
 * Representation of a Lavalink version.
 */
export const version = S.Struct({
    semver: S.String,
    major: S.Number,
    minor: S.Number,
    patch: S.Number,
    preRelease: S.NullOr(S.String),
});

export const git = S.Struct({
    branch: S.String,
    commit: S.String,
    commitTime: S.Number,
});

export const plugin = S.Struct({
    name: S.String,
    version: S.String,
});

export const plugins = S.Array(plugin);

/**
 * Representation of Lavalink server information.
 */
export const info = S.Struct({
    version,
    buildTime: S.Number,
    git,
    jvm: S.String,
    lavaplayer: S.String,
    sourceManagers: S.Array(S.String),
    filters: S.Array(S.String),
    plugins,
});

export type Version = S.Schema.Type<typeof version>;

export type Git = S.Schema.Type<typeof git>;

export type Plugin = S.Schema.Type<typeof plugin>;

export type Plugins = S.Schema.Type<typeof plugins>;
