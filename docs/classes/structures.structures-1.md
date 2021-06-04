[lavaclient](../README.md) / [Exports](../modules.md) / [Structures](../modules/structures.md) / Structures

# Class: Structures

[Structures](../modules/structures.md).Structures

## Table of contents

### Constructors

- [constructor](structures.structures-1.md#constructor)

### Properties

- [structures](structures.structures-1.md#structures)

### Methods

- [extend](structures.structures-1.md#extend)
- [get](structures.structures-1.md#get)

## Constructors

### constructor

• **new Structures**()

## Properties

### structures

▪ `Static` `Private` **structures**: [Classes](../interfaces/structures.classes.md)

#### Defined in

[Structures.ts:6](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/Structures.ts#L6)

## Methods

### extend

▸ `Static` **extend**<K, E\>(`name`, `extend`): `E`

Extend the specified structure.

**`since`** 2.0.0

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | `K`: keyof [Classes](../interfaces/structures.classes.md) |
| `E` | `E`: typeof [Socket](structures_socket.socket.md) \| typeof [Player](structures_player.player.md) \| typeof [Filters](structures_filters.filters.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `K` | The structure to extend. |
| `extend` | (`base`: [Classes](../interfaces/structures.classes.md)[`K`]) => `E` | The extender function. |

#### Returns

`E`

#### Defined in

[Structures.ts:18](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/Structures.ts#L18)

___

### get

▸ `Static` **get**<K\>(`name`): [Classes](../interfaces/structures.classes.md)[`K`]

Get the specified structure.

**`since`** 2.0.0

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | `K`: keyof [Classes](../interfaces/structures.classes.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `K` | The structure to get. |

#### Returns

[Classes](../interfaces/structures.classes.md)[`K`]

#### Defined in

[Structures.ts:31](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/Structures.ts#L31)
