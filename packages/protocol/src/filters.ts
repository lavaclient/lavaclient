import * as S from "@effect/schema/Schema";

export const band = S.struct({
    band: S.number,
    gain: S.optional(S.number),
});

export const equalizer = S.array(band).pipe(S.maxItems(15));

export const karaoke = S.struct({
    level: S.number,
    monoLevel: S.number,
    filterBand: S.number,
    filterWidth: S.number,
}).pipe(S.partial);

export const timescale = S.struct({
    speed: S.number,
    pitch: S.number,
    rate: S.number,
}).pipe(S.partial);

const oscillator = S.struct({
    frequency: S.number,
    depth: S.number,
}).pipe(S.partial);

export const tremolo = oscillator;

export const vibrato = oscillator;

export const distortion = S.record(
    S.union(
        S.templateLiteral(S.literal("sin", "tan", "cos"), S.literal("Offset", "Scale")),
        S.literal("offset", "scale"),
    ),
    S.number,
).pipe(S.partial);

export const rotation = S.struct({
    rotationHz: S.optional(S.number),
});

export const channelMix = S.record(
    S.templateLiteral(S.literal("left", "right"), S.literal("To"), S.literal("Left", "Right")),
    S.number,
).pipe(S.partial);

export const lowPass = S.struct({ smoothing: S.optional(S.number) });

export const filters = S.struct({
    volume: S.number,
    equalizer,
    karaoke,
    timescale,
    tremolo,
    vibrato,
    distortion,
    rotation,
    channelMix,
    lowPass,
    pluginFilters: S.record(S.string, S.unknown),
}).pipe(S.partial);

export type Band = S.Schema.To<typeof band>;

export type Equalizer = S.Schema.To<typeof equalizer>;

export type Karaoke = S.Schema.To<typeof karaoke>;

export type Timescale = S.Schema.To<typeof timescale>;

export type Tremolo = S.Schema.To<typeof tremolo>;

export type Vibrato = S.Schema.To<typeof vibrato>;

export type Distortion = S.Schema.To<typeof distortion>;

export type Rotation = S.Schema.To<typeof rotation>;

export type ChannelMix = S.Schema.To<typeof channelMix>;

export type LowPass = S.Schema.To<typeof lowPass>;

export type Filters = S.Schema.To<typeof filters>;
