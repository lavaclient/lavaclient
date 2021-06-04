[lavaclient](../README.md) / [Exports](../modules.md) / [structures/Filters](../modules/structures_filters.md) / Filters

# Class: Filters

[structures/Filters](../modules/structures_filters.md).Filters

## Table of contents

### Constructors

- [constructor](structures_filters.filters.md#constructor)

### Properties

- [distortion](structures_filters.filters.md#distortion)
- [equalizer](structures_filters.filters.md#equalizer)
- [karaoke](structures_filters.filters.md#karaoke)
- [player](structures_filters.filters.md#player)
- [rotation](structures_filters.filters.md#rotation)
- [timescale](structures_filters.filters.md#timescale)
- [tremolo](structures_filters.filters.md#tremolo)
- [vibrato](structures_filters.filters.md#vibrato)
- [volume](structures_filters.filters.md#volume)
- [DEFAULT\_KARAOKE](structures_filters.filters.md#default_karaoke)
- [DEFAULT\_TIMESCALE](structures_filters.filters.md#default_timescale)
- [DEFAULT\_TREMOLO](structures_filters.filters.md#default_tremolo)
- [DEFAULT\_VOLUME](structures_filters.filters.md#default_volume)

### Accessors

- [isDistortionEnabled](structures_filters.filters.md#isdistortionenabled)
- [isEqualizerEnabled](structures_filters.filters.md#isequalizerenabled)
- [isKaraokeEnabled](structures_filters.filters.md#iskaraokeenabled)
- [isRotationEnabled](structures_filters.filters.md#isrotationenabled)
- [isTimescaleEnabled](structures_filters.filters.md#istimescaleenabled)
- [isTremoloEnabled](structures_filters.filters.md#istremoloenabled)
- [payload](structures_filters.filters.md#payload)

### Methods

- [apply](structures_filters.filters.md#apply)

## Constructors

### constructor

• **new Filters**(`player`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `player` | [Player](structures_player.player.md) | The player instance. |

#### Defined in

[structures/Filters.ts:80](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L80)

## Properties

### distortion

• `Optional` **distortion**: `DistortionFilter`

The distortion filter.

#### Defined in

[structures/Filters.ts:60](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L60)

___

### equalizer

• **equalizer**: `EqualizerFilter`

The equalizer filter.

#### Defined in

[structures/Filters.ts:55](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L55)

___

### karaoke

• `Optional` **karaoke**: `KaraokeFilter`

The karaoke filter.

#### Defined in

[structures/Filters.ts:50](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L50)

___

### player

• `Readonly` **player**: [Player](structures_player.player.md)

The player this filters instance is for..

#### Defined in

[structures/Filters.ts:40](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L40)

___

### rotation

• `Optional` **rotation**: `RotationFilter`

The rotation filter.

#### Defined in

[structures/Filters.ts:75](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L75)

___

### timescale

• `Optional` **timescale**: `TimescaleFilter`

The timescale filter.

#### Defined in

[structures/Filters.ts:45](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L45)

___

### tremolo

• `Optional` **tremolo**: `OscillatingFilter`

The tremolo filter.

#### Defined in

[structures/Filters.ts:70](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L70)

___

### vibrato

• `Optional` **vibrato**: `OscillatingFilter`

The vibrato filter.

#### Defined in

[structures/Filters.ts:80](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L80)

___

### volume

• **volume**: `number`

The volume filter.

#### Defined in

[structures/Filters.ts:65](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L65)

___

### DEFAULT\_KARAOKE

▪ `Static` **DEFAULT\_KARAOKE**: `KaraokeFilter`

The default karaoke configuration.

#### Defined in

[structures/Filters.ts:22](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L22)

___

### DEFAULT\_TIMESCALE

▪ `Static` **DEFAULT\_TIMESCALE**: `TimescaleFilter`

The default configuration for timescale..

#### Defined in

[structures/Filters.ts:13](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L13)

___

### DEFAULT\_TREMOLO

▪ `Static` **DEFAULT\_TREMOLO**: `OscillatingFilter`

The default tremolo configuration.

#### Defined in

[structures/Filters.ts:32](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L32)

___

### DEFAULT\_VOLUME

▪ `Static` **DEFAULT\_VOLUME**: `number` = 1

The default volume configuration

#### Defined in

[structures/Filters.ts:8](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L8)

## Accessors

### isDistortionEnabled

• `get` **isDistortionEnabled**(): `boolean`

#### Returns

`boolean`

#### Defined in

[structures/Filters.ts:99](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L99)

___

### isEqualizerEnabled

• `get` **isEqualizerEnabled**(): `boolean`

Whether the equalizer filter is enabled.
Checks if any of the provided bans doesn't have a gain of 0.0, 0.0 being the default gain.

#### Returns

`boolean`

#### Defined in

[structures/Filters.ts:107](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L107)

___

### isKaraokeEnabled

• `get` **isKaraokeEnabled**(): `boolean`

Whether the karaoke filter is enabled or not.
Checks if the karaoke property does not equal null.

#### Returns

`boolean`

#### Defined in

[structures/Filters.ts:123](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L123)

___

### isRotationEnabled

• `get` **isRotationEnabled**(): `boolean`

Whether the rotation filter is enabled.

#### Returns

`boolean`

#### Defined in

[structures/Filters.ts:95](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L95)

___

### isTimescaleEnabled

• `get` **isTimescaleEnabled**(): `boolean`

Whether the timescale filter is enabled.
Checks if the property does not equal and if any of it's properties doesn't equal 1.0

#### Returns

`boolean`

#### Defined in

[structures/Filters.ts:131](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L131)

___

### isTremoloEnabled

• `get` **isTremoloEnabled**(): `boolean`

Whether the tremolo filter is enabled or not.
Checks if it's null or the depth does not equal 0.0.

#### Returns

`boolean`

#### Defined in

[structures/Filters.ts:115](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L115)

___

### payload

• `get` **payload**(): `Partial`<FilterData\>

The filters payload.

#### Returns

`Partial`<FilterData\>

#### Defined in

[structures/Filters.ts:138](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L138)

## Methods

### apply

▸ **apply**(`prioritize?`): [Filters](structures_filters.filters.md)

Applies the filters to the player.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `prioritize` | `boolean` | false | Whether to prioritize the payload. |

#### Returns

[Filters](structures_filters.filters.md)

#### Defined in

[structures/Filters.ts:171](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Filters.ts#L171)
