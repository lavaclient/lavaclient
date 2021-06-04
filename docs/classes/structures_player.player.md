[lavaclient](../README.md) / [Exports](../modules.md) / [structures/Player](../modules/structures_player.md) / Player

# Class: Player

[structures/Player](../modules/structures_player.md).Player

## Hierarchy

- `EventEmitter`

  ↳ **Player**

## Table of contents

### Constructors

- [constructor](structures_player.player.md#constructor)

### Properties

- [#filters](structures_player.player.md##filters)
- [\_server](structures_player.player.md#_server)
- [\_sessionId](structures_player.player.md#_sessionid)
- [channel](structures_player.player.md#channel)
- [connected](structures_player.player.md#connected)
- [equalizer](structures_player.player.md#equalizer)
- [guild](structures_player.player.md#guild)
- [paused](structures_player.player.md#paused)
- [playing](structures_player.player.md#playing)
- [position](structures_player.player.md#position)
- [socket](structures_player.player.md#socket)
- [timestamp](structures_player.player.md#timestamp)
- [track](structures_player.player.md#track)
- [volume](structures_player.player.md#volume)

### Accessors

- [filters](structures_player.player.md#filters)
- [manager](structures_player.player.md#manager)

### Methods

- [\_event](structures_player.player.md#_event)
- [\_playerUpdate](structures_player.player.md#_playerupdate)
- [connect](structures_player.player.md#connect)
- [destroy](structures_player.player.md#destroy)
- [disconnect](structures_player.player.md#disconnect)
- [handleVoiceUpdate](structures_player.player.md#handlevoiceupdate)
- [move](structures_player.player.md#move)
- [on](structures_player.player.md#on)
- [once](structures_player.player.md#once)
- [pause](structures_player.player.md#pause)
- [play](structures_player.player.md#play)
- [resume](structures_player.player.md#resume)
- [seek](structures_player.player.md#seek)
- [send](structures_player.player.md#send)
- [setEqualizer](structures_player.player.md#setequalizer)
- [setVolume](structures_player.player.md#setvolume)
- [stop](structures_player.player.md#stop)

## Constructors

### constructor

• **new Player**(`socket`, `guild`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `socket` | [Socket](structures_socket.socket.md) | The socket this player belongs to. |
| `guild` | `string` | The guild that this player is for. |

#### Overrides

EventEmitter.constructor

#### Defined in

[structures/Player.ts:81](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L81)

## Properties

### #filters

• `Private` `Optional` **#filters**: [Filters](structures_filters.filters.md)

The filters instance.

#### Defined in

[structures/Player.ts:81](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L81)

___

### \_server

• `Private` **\_server**: `undefined` \| [DiscordVoiceServer](../interfaces/structures_manager.discordvoiceserver.md)

The voice server for this player.

**`internal`**

#### Defined in

[structures/Player.ts:75](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L75)

___

### \_sessionId

• `Private` **\_sessionId**: `undefined` \| `string`

The voice state for this player.

**`internal`**

#### Defined in

[structures/Player.ts:69](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L69)

___

### channel

• **channel**: `undefined` \| `string`

The id of the voice channel this player is connected to.

#### Defined in

[structures/Player.ts:23](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L23)

___

### connected

• **connected**: `boolean`

If this player is connected to a voice channel.

#### Defined in

[structures/Player.ts:63](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L63)

___

### equalizer

• **equalizer**: `EqualizerBand`[]

Equalizer bands this player is using.

#### Defined in

[structures/Player.ts:58](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L58)

___

### guild

• `Readonly` **guild**: `string`

The id of the guild this player belongs to.

#### Defined in

[structures/Player.ts:13](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L13)

___

### paused

• **paused**: `boolean`

Whether this player is paused or not.

#### Defined in

[structures/Player.ts:28](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L28)

___

### playing

• **playing**: `boolean`

Whether this player is playing or not.

#### Defined in

[structures/Player.ts:38](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L38)

___

### position

• **position**: `number`

Track position in milliseconds.

#### Defined in

[structures/Player.ts:48](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L48)

___

### socket

• **socket**: [Socket](structures_socket.socket.md)

The socket this player belongs to.

#### Defined in

[structures/Player.ts:18](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L18)

___

### timestamp

• **timestamp**: `undefined` \| `number`

The unix timestamp in which this player started playing.

#### Defined in

[structures/Player.ts:43](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L43)

___

### track

• **track**: `undefined` \| `string`

The current playing track.

#### Defined in

[structures/Player.ts:33](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L33)

___

### volume

• **volume**: `number`

The current volume of this player.

#### Defined in

[structures/Player.ts:53](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L53)

## Accessors

### filters

• `get` **filters**(): [Filters](structures_filters.filters.md)

The filters instance

**`since`** 3.2.0

#### Returns

[Filters](structures_filters.filters.md)

#### Defined in

[structures/Player.ts:108](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L108)

___

### manager

• `get` **manager**(): [Manager](structures_manager.manager.md)

The head manager of everything.

**`since`** 2.1.0

#### Returns

[Manager](structures_manager.manager.md)

#### Defined in

[structures/Player.ts:120](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L120)

## Methods

### \_event

▸ `Private` **_event**(`event`): `Promise`<void\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `PlayerEvent` |

#### Returns

`Promise`<void\>

#### Defined in

[structures/Player.ts:311](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L311)

___

### \_playerUpdate

▸ `Private` **_playerUpdate**(`update`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `update` | `PlayerUpdate` |

#### Returns

`void`

#### Defined in

[structures/Player.ts:343](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L343)

___

### connect

▸ **connect**(`channel`, `options?`): [Player](structures_player.player.md)

Connects to the specified voice channel.

**`since`** 2.1.x

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `channel` | ``null`` \| `string` \| `Record`<string, any\> | A channel id or object. |
| `options` | [ConnectOptions](../interfaces/structures_player.connectoptions.md) | Options for self mute, self deaf, or force connecting. |

#### Returns

[Player](structures_player.player.md)

#### Defined in

[structures/Player.ts:130](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L130)

___

### destroy

▸ **destroy**(`disconnect?`): [Player](structures_player.player.md)

Destroy this player.

**`since`** 1.x.x

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `disconnect` | `boolean` | false | Disconnect from the voice channel. |

#### Returns

[Player](structures_player.player.md)

#### Defined in

[structures/Player.ts:262](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L262)

___

### disconnect

▸ **disconnect**(): [Player](structures_player.player.md)

Disconnect from the voice channel.

**`since`** 2.1.x

#### Returns

[Player](structures_player.player.md)

#### Defined in

[structures/Player.ts:153](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L153)

___

### handleVoiceUpdate

▸ `Private` **handleVoiceUpdate**(`update`): `Promise`<[Player](structures_player.player.md)\>

Provide a voice update from discord.

**`since`** 1.x.x

#### Parameters

| Name | Type |
| :------ | :------ |
| `update` | [DiscordVoiceServer](../interfaces/structures_manager.discordvoiceserver.md) \| [DiscordVoiceState](../interfaces/structures_manager.discordvoicestate.md) |

#### Returns

`Promise`<[Player](structures_player.player.md)\>

#### Defined in

[structures/Player.ts:275](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L275)

___

### move

▸ **move**(`socket`): `Promise`<[Player](structures_player.player.md)\>

Moves this player to another socket.

**`since`** 3.0.14

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `socket` | [Socket](structures_socket.socket.md) | The socket to move to. |

#### Returns

`Promise`<[Player](structures_player.player.md)\>

#### Defined in

[structures/Player.ts:162](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L162)

___

### on

▸ **on**(`event`, `listener`): [Player](structures_player.player.md)

When the player receives an update from lavalink.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"playerUpdate"`` |
| `listener` | (`update`: `PlayerUpdate`) => `any` |

#### Returns

[Player](structures_player.player.md)

#### Inherited from

EventEmitter.on

#### Defined in

[structures/Player.ts:357](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L357)

▸ **on**(`event`, `listener`): [Player](structures_player.player.md)

Emitted when the player receives a player event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"event"`` |
| `listener` | (`event`: `PlayerEvent`) => `any` |

#### Returns

[Player](structures_player.player.md)

#### Inherited from

EventEmitter.on

#### Defined in

[structures/Player.ts:363](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L363)

▸ **on**(`event`, `listener`): [Player](structures_player.player.md)

Emitted when the websocket was closed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"closed"`` |
| `listener` | (`event`: `WebSocketClosedEvent`) => `any` |

#### Returns

[Player](structures_player.player.md)

#### Inherited from

EventEmitter.on

#### Defined in

[structures/Player.ts:369](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L369)

▸ **on**(`event`, `listener`): [Player](structures_player.player.md)

Emitted when a track stops.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"end"`` |
| `listener` | (`event`: `TrackEndEvent`) => `any` |

#### Returns

[Player](structures_player.player.md)

#### Inherited from

EventEmitter.on

#### Defined in

[structures/Player.ts:375](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L375)

▸ **on**(`event`, `listener`): [Player](structures_player.player.md)

Emitted when the player has ran into an exception.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"error"`` |
| `listener` | (`event`: `TrackExceptionEvent`) => `any` |

#### Returns

[Player](structures_player.player.md)

#### Inherited from

EventEmitter.on

#### Defined in

[structures/Player.ts:381](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L381)

▸ **on**(`event`, `listener`): [Player](structures_player.player.md)

Emitted when a player has started a track.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"start"`` |
| `listener` | (`event`: `TrackStartEvent`) => `any` |

#### Returns

[Player](structures_player.player.md)

#### Inherited from

EventEmitter.on

#### Defined in

[structures/Player.ts:387](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L387)

▸ **on**(`event`, `listener`): [Player](structures_player.player.md)

Emitted when a track is stuck.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"stuck"`` |
| `listener` | (`event`: `TrackStuckEvent`) => `any` |

#### Returns

[Player](structures_player.player.md)

#### Inherited from

EventEmitter.on

#### Defined in

[structures/Player.ts:393](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L393)

___

### once

▸ **once**(`event`, `listener`): [Player](structures_player.player.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"playerUpdate"`` |
| `listener` | (`update`: `PlayerUpdate`) => `any` |

#### Returns

[Player](structures_player.player.md)

#### Inherited from

EventEmitter.once

#### Defined in

[structures/Player.ts:358](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L358)

▸ **once**(`event`, `listener`): [Player](structures_player.player.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"event"`` |
| `listener` | (`event`: `PlayerEvent`) => `any` |

#### Returns

[Player](structures_player.player.md)

#### Inherited from

EventEmitter.once

#### Defined in

[structures/Player.ts:364](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L364)

▸ **once**(`event`, `listener`): [Player](structures_player.player.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"closed"`` |
| `listener` | (`event`: `WebSocketClosedEvent`) => `any` |

#### Returns

[Player](structures_player.player.md)

#### Inherited from

EventEmitter.once

#### Defined in

[structures/Player.ts:370](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L370)

▸ **once**(`event`, `listener`): [Player](structures_player.player.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"end"`` |
| `listener` | (`event`: `TrackEndEvent`) => `any` |

#### Returns

[Player](structures_player.player.md)

#### Inherited from

EventEmitter.once

#### Defined in

[structures/Player.ts:376](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L376)

▸ **once**(`event`, `listener`): [Player](structures_player.player.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"error"`` |
| `listener` | (`event`: `TrackExceptionEvent`) => `any` |

#### Returns

[Player](structures_player.player.md)

#### Inherited from

EventEmitter.once

#### Defined in

[structures/Player.ts:382](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L382)

▸ **once**(`event`, `listener`): [Player](structures_player.player.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"start"`` |
| `listener` | (`event`: `TrackStartEvent`) => `any` |

#### Returns

[Player](structures_player.player.md)

#### Inherited from

EventEmitter.once

#### Defined in

[structures/Player.ts:388](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L388)

▸ **once**(`event`, `listener`): [Player](structures_player.player.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"stuck"`` |
| `listener` | (`event`: `TrackStuckEvent`) => `any` |

#### Returns

[Player](structures_player.player.md)

#### Inherited from

EventEmitter.once

#### Defined in

[structures/Player.ts:394](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L394)

___

### pause

▸ **pause**(`state?`): [Player](structures_player.player.md)

Change the paused state of this player. `true` to pause, `false` to resume.

**`since`** 1.x.x

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `state` | `boolean` | true | Pause state, defaults to true. |

#### Returns

[Player](structures_player.player.md)

#### Defined in

[structures/Player.ts:202](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L202)

___

### play

▸ **play**(`track`, `options?`): [Player](structures_player.player.md)

Plays the specified base64 track.

**`since`** 1.x.x

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `track` | `string` \| `Track` | The track to play. |
| `options` | [PlayOptions](../interfaces/structures_player.playoptions.md) | Play options to send along with the track. |

#### Returns

[Player](structures_player.player.md)

#### Defined in

[structures/Player.ts:179](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L179)

___

### resume

▸ **resume**(): [Player](structures_player.player.md)

Resumes the player, if paused.

**`since`** 1.x.x

#### Returns

[Player](structures_player.player.md)

#### Defined in

[structures/Player.ts:212](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L212)

___

### seek

▸ **seek**(`position`): [Player](structures_player.player.md)

Seek to a position in the current song.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `position` | `number` | The position to seek to in milliseconds. |

#### Returns

[Player](structures_player.player.md)

#### Defined in

[structures/Player.ts:232](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L232)

___

### send

▸ **send**(`op`, `data?`, `priority?`): [Player](structures_player.player.md)

Send data to lavalink as this player.

**`since`** 1.0.0

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `op` | `OpCode` | `undefined` | The operation. |
| `data` | [Dictionary](../modules/structures_manager.md#dictionary)<any\> | {} | The data. |
| `priority` | `boolean` | false | Whether or not this is a prioritized operation. |

#### Returns

[Player](structures_player.player.md)

#### Defined in

[structures/Player.ts:300](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L300)

___

### setEqualizer

▸ **setEqualizer**(`bands`, `asFilter?`): [Player](structures_player.player.md)

Sets the equalizer of this player.

**`since`** 2.1.x

**`deprecated`** Please use Filters#equalizer and Filters#apply

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `bands` | `EqualizerBand`[] | `undefined` | Equalizer bands to use. |
| `asFilter` | `Boolean` | false | - |

#### Returns

[Player](structures_player.player.md)

#### Defined in

[structures/Player.ts:246](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L246)

___

### setVolume

▸ **setVolume**(`volume?`): [Player](structures_player.player.md)

Change the volume of the player. You can omit the volume param to reset back to 100

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `volume` | `number` | 100 | May range from 0 to 1000, defaults to 100 |

#### Returns

[Player](structures_player.player.md)

#### Defined in

[structures/Player.ts:188](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L188)

___

### stop

▸ **stop**(): [Player](structures_player.player.md)

Stops the current playing track.

**`since`** 1.x.x

#### Returns

[Player](structures_player.player.md)

#### Defined in

[structures/Player.ts:220](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Player.ts#L220)
