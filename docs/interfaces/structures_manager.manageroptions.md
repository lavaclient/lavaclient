[lavaclient](../README.md) / [Exports](../modules.md) / [structures/Manager](../modules/structures_manager.md) / ManagerOptions

# Interface: ManagerOptions

[structures/Manager](../modules/structures_manager.md).ManagerOptions

## Table of contents

### Properties

- [plugins](structures_manager.manageroptions.md#plugins)
- [reconnect](structures_manager.manageroptions.md#reconnect)
- [resuming](structures_manager.manageroptions.md#resuming)
- [send](structures_manager.manageroptions.md#send)
- [shards](structures_manager.manageroptions.md#shards)
- [userId](structures_manager.manageroptions.md#userid)

## Properties

### plugins

• `Optional` **plugins**: [Plugin](../classes/structures_plugin.plugin.md)[]

An array of plugins you want to use.

#### Defined in

[structures/Manager.ts:283](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L283)

___

### reconnect

• `Optional` **reconnect**: [ReconnectOptions](structures_manager.reconnectoptions.md)

Options for reconnection.

#### Defined in

[structures/Manager.ts:293](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L293)

___

### resuming

• `Optional` **resuming**: `boolean` \| [ResumeOptions](structures_manager.resumeoptions.md)

If you want to enable resuming.

#### Defined in

[structures/Manager.ts:288](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L288)

___

### send

• **send**: [Send](../modules/structures_manager.md#send)

A method used for sending discord voice updates.

#### Defined in

[structures/Manager.ts:268](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L268)

___

### shards

• `Optional` **shards**: `number`

The number of shards the client has.

#### Defined in

[structures/Manager.ts:273](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L273)

___

### userId

• `Optional` **userId**: `string`

The user id of the bot (not-recommended, provide it in Manager#init)

#### Defined in

[structures/Manager.ts:278](https://github.com/Lavaclient/lavaclient/blob/5ad9bfc/src/structures/Manager.ts#L278)
