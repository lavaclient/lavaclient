# Lavaclient

> A simple and lightweight [Lavalink](https://github.com/Frederikam/Lavalink) client written in TypeScript. Works with Discord.js and Eris.

- 📦 **Lightweight**: Lavaclient depends on almost 0 dependencies and it is modular to increase performance and speed.
- 🔰 **Simplistic**: Lavaclient is designed to be simple and it is highly user-friendly.
- 🔋 **Plugins**: [WIP] Plugins are addons that can be easily added to Lavaclient to enable custom functionality and queue support.

[Discord Server](https://discord.gg/BnQECNd) • [GitHub](https://github.com/lavaclient/lavaclient)

## Installation

```shell
npm install lavaclient
```

### Plugins

- [Lavaclient REST](https://npmjs.com/lavaclient-rest-plugin)

## Example usage

The only setup example as of right now is for discord.js.

```ts
import { Manager } from "lavaclient";
import { Client } from "discord.js";

const nodes = [
  {
    name: "main",
    address: "localhost",
    password: "youshallnotpass",
    port: 2333,
  },
];

const client = new Client();
const manager = new Manager(nodes, {
  send: (guildId, packet) => {
    const guild = client.guilds.cache.get(guildId);
    if (guild) return guild.shard.send(packet);
    return;
  },
});

client.on("ready", () => manager.init(client.user.id));
client.ws.on("VOICE_SERVER_UPDATE", (pk) => manager.serverUpdate(pk));
client.ws.on("VOICE_STATE_UPDATE", (pk) => manager.stateUpdate(pk));
```

### Joining & Leaving

```ts
const player = manager.summonPlayer("696355996657909790");

await player.connect("696359398708215848", { deaf: true });
await player.leave();
```

### Destroying a Player

```ts
manager.removePlayer("696355996657909790");
```

## Contributers

- [MeLike2D](https://github.com/lolwastedjs)
- [Chroventer](https://github.com/chroventer)
