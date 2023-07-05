import * as Fn from "@effect/data/Function";
import * as S from "@effect/schema/Schema";

export const volumeType = S.literal("volume");

export const volume = Fn.pipe(S.number, S.between(0, 5));

export const equalizerBand = S.struct({
    band: Fn.pipe(S.number, S.between(0, 14)),
    gain: Fn.pipe(S.number, S.between(-0.25, 1.0)),
});

export const equalizerType = S.literal("equalizer");

export const equalizer = S.array(equalizerBand);

export const karaokeType = S.literal("karaoke");

export const karaoke = S.struct({
    level: Fn.pipe(S.number, S.between(0, 1)),
    monoLevel: Fn.pipe(S.number, S.between(0, 1)),
    stereoSpread: S.number,
    roomSize: S.number,
});

export const timescaleType = S.literal("timescale");

export const timescale = S.struct({
    speed: Fn.pipe(S.number, S.nonNegative()),
    pitch: Fn.pipe(S.number, S.nonNegative()),
    rate: Fn.pipe(S.number, S.nonNegative()),
});

export const tremoloType = S.literal("tremolo");

export const tremolo = S.struct({
    frequency: Fn.pipe(S.number, S.greaterThan(0)),
    depth: Fn.pipe(S.number, S.between(0.1, 1)),
});

export const vibratoType = S.literal("vibrato");

export const vibrato = S.struct({
    frequency: Fn.pipe(S.number, S.between(0.1, 14)),
    depth: Fn.pipe(S.number, S.between(0.1, 1)),
});

export const rotationType = S.literal("rotation");

export const rotation = S.struct({
    rotationHz: S.number,
});

export const distortionType = S.literal("distortion");

export const distortion = S.struct({
    sinOffset: S.number,
    sinScale: S.number,
    cosOffset: S.number,
    cosScale: S.number,
    tanOffset: S.number,
    tanScale: S.number,
    offset: S.number,
    scale: S.number,
});

export const channelMixType = S.literal("channelMix");

export const channelMix = S.struct({
    leftToLeft: S.number,
    leftToRight: S.number,
    rightToLeft: S.number,
    rightToRight: S.number,
});

export const lowPassType = S.literal("lowPass");

export const lowPass = S.struct({
    smoothing: S.number,
});

export const filterType = S.union(
    volumeType,
    equalizerType,
    karaokeType,
    timescaleType,
    tremoloType,
    vibratoType,
    rotationType,
    distortionType,
    channelMixType,
    lowPassType,
);

export const builtInFilters = S.struct({
    volume,
    equalizer,
    karaoke: S.partial(karaoke),
    timescale: S.partial(timescale),
    tremolo: S.partial(tremolo),
    vibrato: S.partial(vibrato),
    rotation: S.partial(rotation),
    distortion: S.partial(distortion),
    channelMix: S.partial(channelMix),
    lowPass: S.partial(lowPass),
});

export const pluginFilters = S.record(S.string, S.unknown);

export const filter = S.union(
    S.struct({ type: volumeType, data: volume }),
    S.struct({ type: equalizerType, data: equalizer }),
    S.struct({ type: karaokeType, data: S.partial(karaoke) }),
    S.struct({ type: timescaleType, data: S.partial(timescale) }),
    S.struct({ type: tremoloType, data: S.partial(tremolo) }),
    S.struct({ type: vibratoType, data: S.partial(vibrato) }),
    S.struct({ type: rotationType, data: S.partial(rotation) }),
    S.struct({ type: distortionType, data: S.partial(distortion) }),
    S.struct({ type: channelMixType, data: S.partial(channelMix) }),
    S.struct({ type: lowPassType, data: S.partial(lowPass) }),
);

export type Volume = S.To<typeof volume>;

export type EqualizerBand = S.To<typeof equalizerBand>;

export type Equalizer = S.To<typeof equalizer>;

export type Karaoke = S.To<typeof karaoke>;

export type Timescale = S.To<typeof timescale>;

export type Tremolo = S.To<typeof tremolo>;

export type Vibrato = S.To<typeof vibrato>;

export type Rotation = S.To<typeof rotation>;

export type Distortion = S.To<typeof distortion>;

export type ChannelMix = S.To<typeof channelMix>;

export type LowPass = S.To<typeof lowPass>;

export type FilterType = S.To<typeof filterType>;

export type Filter = S.To<typeof filter>;
