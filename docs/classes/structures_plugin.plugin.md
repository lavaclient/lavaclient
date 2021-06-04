[lavaclient](../README.md) / [Exports](../modules.md) / [structures/Plugin](../modules/structures_plugin.md) / Plugin

# Class: Plugin

[structures/Plugin](../modules/structures_plugin.md).Plugin

## Table of contents

### Constructors

- [constructor](structures_plugin.plugin.md#constructor)

### Properties

- [manager](structures_plugin.plugin.md#manager)

### Methods

- [init](structures_plugin.plugin.md#init)
- [load](structures_plugin.plugin.md#load)

## Constructors

### constructor

• **new Plugin**()

## Properties

### manager

• **manager**: [Manager](structures_manager.manager.md)

The manager that loaded this plugin.

#### Defined in

[structures/Plugin.ts:7](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Plugin.ts#L7)

## Methods

### init

▸ **init**(): `void`

Called when the manager is initialized.

**`since`** 3.0.0

#### Returns

`void`

#### Defined in

[structures/Plugin.ts:23](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Plugin.ts#L23)

___

### load

▸ **load**(`manager`): `void`

Called when this plugin is loaded.

**`since`** 3.0.0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `manager` | [Manager](structures_manager.manager.md) | The manager that loaded this plugin. |

#### Returns

`void`

#### Defined in

[structures/Plugin.ts:14](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Plugin.ts#L14)
