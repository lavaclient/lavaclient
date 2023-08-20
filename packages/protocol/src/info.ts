import * as S from "@effect/schema/Schema";

/**
 * Representation of a Lavalink version.
 */
export const version = S.struct({
    semver: S.string,
    major: S.number,
    minor: S.number,
    patch: S.number,
    preRelease: S.nullable(S.string),
});

export const git = S.struct({
    branch: S.string,
    commit: S.string,
    commitTime: S.number,
});

export const plugin = S.struct({
    name: S.string,
    version: S.string,
});

export const plugins = S.array(plugin);

/**
 * Representation of Lavalink server information.
 */
export const info = S.struct({
    version,
    buildTime: S.number,
    git,
    jvm: S.string,
    lavaplayer: S.string,
    sourceManagers: S.array(S.string),
    filters: S.array(S.string),
    plugins,
});

export type Version = S.To<typeof version>;

export type Git = S.To<typeof git>;

export type Plugin = S.To<typeof plugin>;

export type Plugins = S.To<typeof plugins>;
