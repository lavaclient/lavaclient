# lavaclient

A simple and lightweight lavalink client made in [Typescript](https://www.typescriptlang.org/).

- 📦 Lightweight
- 🔰 Simple for Beginners.
- ⛓ Strict Typings.

[Discord Server](https://discord.gg/BnQECNd) • [GitHub](https://github.com/lavaclient/lavaclient)

## Plugins

- [REST Functionality](https://npmjs.com/lavaclient-rest-plugin)

## Introduction

Lavaclient doesn't depend on discord.js or eris so you can use it with any discord api wrapper you would like.
Here are some benefits to using Lavaclient:

- Lightweight: It has clean and simple code, it uses no packages that include code; Just a package containing lavalink typings.
  - No Bloat: Lavaclient only uses 3 classes that's only for the functionality, unlike other packages where they have several classes just for storage.
- Plugins: We have some plugins coming soon that allows for REST functionality and queue support.

### Setup

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

## Installation

Support is held in <https://discord.gg/BnQECNd>

```bash
npm install lavaclient
```

## Contributers

- [MeLike2D](https://github.com/lolwastedjs)
- [Chroventer](https://github.com/chroventer)
