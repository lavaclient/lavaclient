[lavaclient](../README.md) / [Exports](../modules.md) / [structures/Manager](../modules/structures_manager.md) / Manager

# Class: Manager

[structures/Manager](../modules/structures_manager.md).Manager

## Hierarchy

- `EventEmitter`

  ↳ **Manager**

## Table of contents

### Constructors

- [constructor](structures_manager.manager.md#constructor)

### Properties

- [nodes](structures_manager.manager.md#nodes)
- [options](structures_manager.manager.md#options)
- [players](structures_manager.manager.md#players)
- [plugins](structures_manager.manager.md#plugins)
- [resuming](structures_manager.manager.md#resuming)
- [send](structures_manager.manager.md#send)
- [sockets](structures_manager.manager.md#sockets)
- [userId](structures_manager.manager.md#userid)

### Accessors

- [ideal](structures_manager.manager.md#ideal)

### Methods

- [create](structures_manager.manager.md#create)
- [destroy](structures_manager.manager.md#destroy)
- [init](structures_manager.manager.md#init)
- [on](structures_manager.manager.md#on)
- [search](structures_manager.manager.md#search)
- [serverUpdate](structures_manager.manager.md#serverupdate)
- [stateUpdate](structures_manager.manager.md#stateupdate)
- [use](structures_manager.manager.md#use)

## Constructors

### constructor

• **new Manager**(`nodes`, `options`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodes` | [SocketData](../interfaces/structures_socket.socketdata.md)[] | An array of sockets to connect to. |
| `options` | [ManagerOptions](../interfaces/structures_manager.manageroptions.md) |  |

#### Overrides

EventEmitter.constructor

#### Defined in

[structures/Manager.ts:64](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L64)

## Properties

### nodes

• `Private` `Readonly` **nodes**: [SocketData](../interfaces/structures_socket.socketdata.md)[]

The array of socket data this manager was created with.

#### Defined in

[structures/Manager.ts:64](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L64)

___

### options

• **options**: `Required`<[ManagerOptions](../interfaces/structures_manager.manageroptions.md)\>

The options this manager was created with.

#### Defined in

[structures/Manager.ts:39](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L39)

___

### players

• `Readonly` **players**: `Map`<string, [Player](structures_player.player.md)\>

A map of connected players.

#### Defined in

[structures/Manager.ts:34](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L34)

___

### plugins

• `Private` **plugins**: [Plugin](structures_plugin.plugin.md)[] = []

An array of registered plugins.

#### Defined in

[structures/Manager.ts:59](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L59)

___

### resuming

• **resuming**: [ResumeOptions](../interfaces/structures_manager.resumeoptions.md)

Resume options.

#### Defined in

[structures/Manager.ts:54](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L54)

___

### send

• **send**: [Send](../modules/structures_manager.md#send)

A send method for sending voice state updates to discord.

#### Defined in

[structures/Manager.ts:49](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L49)

___

### sockets

• `Readonly` **sockets**: `Map`<string, [Socket](structures_socket.socket.md)\>

A map of connected sockets.

#### Defined in

[structures/Manager.ts:29](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L29)

___

### userId

• **userId**: `undefined` \| `string`

The client's user id.

#### Defined in

[structures/Manager.ts:44](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L44)

## Accessors

### ideal

• `get` **ideal**(): [Socket](structures_socket.socket.md)[]

Ideal nodes to use.

#### Returns

[Socket](structures_socket.socket.md)[]

#### Defined in

[structures/Manager.ts:105](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L105)

## Methods

### create

▸ **create**(`guild`, `socket?`): [Player](structures_player.player.md)

Create a player.

**`since`** 2.1.0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `guild` | `string` \| [Dictionary](../modules/structures_manager.md#dictionary)<any\> | The guild this player is for. |
| `socket` | [Socket](structures_socket.socket.md) | The socket to use. |

#### Returns

[Player](structures_player.player.md)

#### Defined in

[structures/Manager.ts:187](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L187)

___

### destroy

▸ **destroy**(`guild`): `Promise`<boolean\>

Destroys a player and leaves the connected voice channel.

**`since`** 2.1.0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `guild` | `string` \| [Dictionary](../modules/structures_manager.md#dictionary)<any\> | The guild id of the player to destroy. |

#### Returns

`Promise`<boolean\>

#### Defined in

[structures/Manager.ts:210](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L210)

___

### init

▸ **init**(`userId?`): `void`

Initializes this manager. Connects all provided sockets.

**`since`** 1.0.0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `userId` | `string` | The client user id. |

#### Returns

`void`

#### Defined in

[structures/Manager.ts:114](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L114)

___

### on

▸ **on**(`event`, `listener`): [Manager](structures_manager.manager.md)

Emitted when a lavalink socket is ready.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"socketReady"`` |
| `listener` | (`socket`: [Socket](structures_socket.socket.md)) => `any` |

#### Returns

[Manager](structures_manager.manager.md)

#### Inherited from

EventEmitter.on

#### Defined in

[structures/Manager.ts:246](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L246)

▸ **on**(`event`, `listener`): [Manager](structures_manager.manager.md)

Emitted when a lavalink socket has ran into an error.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"socketError"`` |
| `listener` | (`error`: `any`, `socket`: [Socket](structures_socket.socket.md)) => `any` |

#### Returns

[Manager](structures_manager.manager.md)

#### Inherited from

EventEmitter.on

#### Defined in

[structures/Manager.ts:251](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L251)

▸ **on**(`event`, `listener`): [Manager](structures_manager.manager.md)

Emitted when a lavalink socket has been closed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"socketClose"`` |
| `listener` | (`event`: `CloseEvent`, `socket`: [Socket](structures_socket.socket.md)) => `any` |

#### Returns

[Manager](structures_manager.manager.md)

#### Inherited from

EventEmitter.on

#### Defined in

[structures/Manager.ts:256](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L256)

▸ **on**(`event`, `listener`): [Manager](structures_manager.manager.md)

Emitted when a lavalink socket has ran out of reconnect tries.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"socketDisconnect"`` |
| `listener` | (`socket`: [Socket](structures_socket.socket.md)) => `any` |

#### Returns

[Manager](structures_manager.manager.md)

#### Inherited from

EventEmitter.on

#### Defined in

[structures/Manager.ts:261](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L261)

___

### search

▸ **search**(`query`): `Promise`<LoadTracksResponse\>

Search lavalink for songs.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `query` | `string` | The search query. |

#### Returns

`Promise`<LoadTracksResponse\>

#### Defined in

[structures/Manager.ts:226](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L226)

___

### serverUpdate

▸ **serverUpdate**(`update`): `Promise`<void\>

Used for providing voice server updates to lavalink.

**`since`** 1.0.0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `update` | [DiscordVoiceServer](../interfaces/structures_manager.discordvoiceserver.md) | The voice server update sent by Discord. |

#### Returns

`Promise`<void\>

#### Defined in

[structures/Manager.ts:155](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L155)

___

### stateUpdate

▸ **stateUpdate**(`update`): `Promise`<void\>

Used for providing voice state updates to lavalink

**`since`** 1.0.0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `update` | [DiscordVoiceState](../interfaces/structures_manager.discordvoicestate.md) | The voice state update sent by Discord. |

#### Returns

`Promise`<void\>

#### Defined in

[structures/Manager.ts:169](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L169)

___

### use

▸ **use**(`plugin`): [Manager](structures_manager.manager.md)

Register a plugin for use.

**`since`** 2.x.x

#### Parameters

| Name | Type |
| :------ | :------ |
| `plugin` | [Plugin](structures_plugin.plugin.md) |

#### Returns

[Manager](structures_manager.manager.md)

#### Defined in

[structures/Manager.ts:144](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L144)
