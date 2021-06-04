[lavaclient](../README.md) / [Exports](../modules.md) / [structures/Socket](../modules/structures_socket.md) / Socket

# Class: Socket

[structures/Socket](../modules/structures_socket.md).Socket

## Table of contents

### Constructors

- [constructor](structures_socket.socket.md#constructor)

### Properties

- [host](structures_socket.socket.md#host)
- [id](structures_socket.socket.md#id)
- [manager](structures_socket.socket.md#manager)
- [password](structures_socket.socket.md#password)
- [port](structures_socket.socket.md#port)
- [queue](structures_socket.socket.md#queue)
- [reconnectTimeout](structures_socket.socket.md#reconnecttimeout)
- [remainingTries](structures_socket.socket.md#remainingtries)
- [resumeKey](structures_socket.socket.md#resumekey)
- [secure](structures_socket.socket.md#secure)
- [stats](structures_socket.socket.md#stats)
- [status](structures_socket.socket.md#status)
- [ws](structures_socket.socket.md#ws)

### Accessors

- [address](structures_socket.socket.md#address)
- [connected](structures_socket.socket.md#connected)
- [penalties](structures_socket.socket.md#penalties)
- [reconnection](structures_socket.socket.md#reconnection)

### Methods

- [\_cleanup](structures_socket.socket.md#_cleanup)
- [\_close](structures_socket.socket.md#_close)
- [\_error](structures_socket.socket.md#_error)
- [\_message](structures_socket.socket.md#_message)
- [\_open](structures_socket.socket.md#_open)
- [\_processQueue](structures_socket.socket.md#_processqueue)
- [\_send](structures_socket.socket.md#_send)
- [configureResuming](structures_socket.socket.md#configureresuming)
- [connect](structures_socket.socket.md#connect)
- [reconnect](structures_socket.socket.md#reconnect)
- [send](structures_socket.socket.md#send)

## Constructors

### constructor

• **new Socket**(`manager`, `data`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `manager` | [Manager](structures_manager.manager.md) |
| `data` | [SocketData](../interfaces/structures_socket.socketdata.md) |

#### Defined in

[structures/Socket.ts:78](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L78)

## Properties

### host

• **host**: `string`

Hostname of the lavalink node.

#### Defined in

[structures/Socket.ts:38](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L38)

___

### id

• `Readonly` **id**: `string`

This lavalink nodes identifier.

#### Defined in

[structures/Socket.ts:23](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L23)

___

### manager

• `Readonly` **manager**: [Manager](structures_manager.manager.md)

The manager instance.

#### Defined in

[structures/Socket.ts:18](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L18)

___

### password

• **password**: `string`

Password of the lavalink node.

#### Defined in

[structures/Socket.ts:48](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L48)

___

### port

• `Optional` **port**: `number`

Port of the lavalink node.

#### Defined in

[structures/Socket.ts:43](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L43)

___

### queue

• `Private` `Readonly` **queue**: `unknown`[]

Queue for outgoing messages.

#### Defined in

[structures/Socket.ts:78](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L78)

___

### reconnectTimeout

• `Private` **reconnectTimeout**: `Timeout`

The timeout for reconnecting.

#### Defined in

[structures/Socket.ts:68](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L68)

___

### remainingTries

• **remainingTries**: `number`

Number of remaining reconnect tries.

#### Defined in

[structures/Socket.ts:28](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L28)

___

### resumeKey

• `Optional` **resumeKey**: `string`

The resume key.

#### Defined in

[structures/Socket.ts:58](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L58)

___

### secure

• **secure**: `boolean`

Whether or not this lavalink node uses an ssl.

#### Defined in

[structures/Socket.ts:63](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L63)

___

### stats

• **stats**: `StatsData`

The performance stats of this player.

#### Defined in

[structures/Socket.ts:53](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L53)

___

### status

• **status**: [Status](../enums/structures_socket.status.md)

The status of this lavalink node.

#### Defined in

[structures/Socket.ts:33](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L33)

___

### ws

• `Private` `Optional` **ws**: `WebSocket`

WebSocket instance for this socket.

#### Defined in

[structures/Socket.ts:73](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L73)

## Accessors

### address

• `get` **address**(): `string`

The address of this lavalink node.

#### Returns

`string`

#### Defined in

[structures/Socket.ts:137](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L137)

___

### connected

• `get` **connected**(): `boolean`

If this node is connected or not.

#### Returns

`boolean`

#### Defined in

[structures/Socket.ts:129](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L129)

___

### penalties

• `get` **penalties**(): `number`

Get the total penalty count for this node.

#### Returns

`number`

#### Defined in

[structures/Socket.ts:144](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L144)

___

### reconnection

• `get` **reconnection**(): [ReconnectOptions](../interfaces/structures_manager.reconnectoptions.md)

The reconnection options

#### Returns

[ReconnectOptions](../interfaces/structures_manager.reconnectoptions.md)

#### Defined in

[structures/Socket.ts:122](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L122)

## Methods

### \_cleanup

▸ `Private` **_cleanup**(): `void`

Cleans up the websocket listeners.

**`since`** 1.0.0

#### Returns

`void`

#### Defined in

[structures/Socket.ts:345](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L345)

___

### \_close

▸ `Private` **_close**(`event`): `void`

Handles the close of the websocket.

**`since`** 1.0.0

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `CloseEvent` |

#### Returns

`void`

#### Defined in

[structures/Socket.ts:291](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L291)

___

### \_error

▸ `Private` **_error**(`event`): `void`

Handles a websocket error.

**`since`** 1.0.0

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `ErrorEvent` |

#### Returns

`void`

#### Defined in

[structures/Socket.ts:308](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L308)

___

### \_message

▸ `Private` **_message**(`__namedParameters`): `Promise`<void\>

Handles incoming messages from lavalink.

**`since`** 1.0.0

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `MessageEvent` |

#### Returns

`Promise`<void\>

#### Defined in

[structures/Socket.ts:263](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L263)

___

### \_open

▸ `Private` **_open**(): `Promise`<void\>

Handles the opening of the websocket.

#### Returns

`Promise`<void\>

#### Defined in

[structures/Socket.ts:249](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L249)

___

### \_processQueue

▸ `Private` **_processQueue**(): `void`

#### Returns

`void`

#### Defined in

[structures/Socket.ts:316](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L316)

___

### \_send

▸ `Private` **_send**(`payload`): `void`

Sends a payload to the lavalink server.

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `unknown` |

#### Returns

`void`

#### Defined in

[structures/Socket.ts:334](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L334)

___

### configureResuming

▸ `Private` **configureResuming**(): `void`

Configures lavalink resuming.

**`since`** 1.0.0

#### Returns

`void`

#### Defined in

[structures/Socket.ts:233](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L233)

___

### connect

▸ **connect**(): `void`

Connects to the lavalink node.

**`since`** 1.0.0

#### Returns

`void`

#### Defined in

[structures/Socket.ts:177](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L177)

___

### reconnect

▸ **reconnect**(): `void`

Reconnect to the lavalink node.

#### Returns

`void`

#### Defined in

[structures/Socket.ts:209](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L209)

___

### send

▸ **send**(`data`, `priority?`): `void`

Send a message to lavalink.

**`since`** 1.0.0

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `data` | `OutgoingMessage` | `undefined` | The message data. |
| `priority` | `boolean` | false | If this message should be prioritized. |

#### Returns

`void`

#### Defined in

[structures/Socket.ts:163](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Socket.ts#L163)
