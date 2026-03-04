import * as S from "@effect/schema/Schema";

export const band = S.Struct({
    band: S.Number,
    gain: S.optional(S.Number),
});

export const equalizer = S.Array(band).pipe(S.maxItems(15));

export const karaoke = S.Struct({
    level: S.Number,
    monoLevel: S.Number,
    filterBand: S.Number,
    filterWidth: S.Number,
}).pipe(S.partial());

export const timescale = S.Struct({
    speed: S.Number,
    pitch: S.Number,
    rate: S.Number,
}).pipe(S.partial());

const oscillator = S.Struct({
    frequency: S.Number,
    depth: S.Number,
}).pipe(S.partial());

export const tremolo = oscillator;

export const vibrato = oscillator;

export const distortion = S.Record(
    S.Union(
        S.TemplateLiteral(S.Literal("sin", "tan", "cos"), S.Literal("Offset", "Scale")),
        S.Literal("offset", "scale"),
    ),
    S.Number,
).pipe(S.partial());

export const rotation = S.Struct({
    rotationHz: S.optional(S.Number),
});

export const channelMix = S.Record(
    S.TemplateLiteral(S.Literal("left", "right"), S.Literal("To"), S.Literal("Left", "Right")),
    S.Number,
).pipe(S.partial());

export const lowPass = S.Struct({ smoothing: S.optional(S.Number) });

export const filters = S.Struct({
    volume: S.Number,
    equalizer,
    karaoke,
    timescale,
    tremolo,
    vibrato,
    distortion,
    rotation,
    channelMix,
    lowPass,
    pluginFilters: S.Record(S.String, S.Unknown),
}).pipe(S.partial());

export type Band = S.Schema.Type<typeof band>;

export type Equalizer = S.Schema.Type<typeof equalizer>;

export type Karaoke = S.Schema.Type<typeof karaoke>;

export type Timescale = S.Schema.Type<typeof timescale>;

export type Tremolo = S.Schema.Type<typeof tremolo>;

export type Vibrato = S.Schema.Type<typeof vibrato>;

export type Distortion = S.Schema.Type<typeof distortion>;

export type Rotation = S.Schema.Type<typeof rotation>;

export type ChannelMix = S.Schema.Type<typeof channelMix>;

export type LowPass = S.Schema.Type<typeof lowPass>;

export type Filters = S.Schema.Type<typeof filters>;
