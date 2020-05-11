# Lavaclient &middot; [![Discord](https://discordapp.com/api/guilds/696355996657909790/embed.png)](https://discord.gg/BnQECNd) [![Version](https://img.shields.io/npm/v/lavaclient.svg?maxAge=3600)](https://npmjs.com/lavaclient) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/fe049eb85ee74900ae764fc5af6a6299)](https://www.codacy.com/gh/Lavaclient/lavaclient?utm_source=github.com&utm_medium=referral&utm_content=Lavaclient/lavaclient&utm_campaign=Badge_Grade)

> A simple and lightweight [Lavalink](https://github.com/Frederikam/Lavalink) client written in TypeScript. Works with any Discord Library.

- 📦 **Lightweight**: Lavaclient depends on almost 0 dependencies and it is modular to increase performance and speed.
- 🔰 **Simplistic**: Lavaclient is designed to be simple and it is highly user-friendly.
- 🔋 **Plugins**: [WIP] Plugins are addons that can be easily added to Lavaclient to enable custom functionality and queue support.

## Installation

```shell
npm install lavaclient
```

### Plugins

Lavaclient has a plugins system but as of right now it is very limited in things you can do. They are a Work-In-Progress.

- [Lavaclient REST](https://npmjs.com/lavaclient-rest-plugin)
- [Lavaclient Queue](https://npmjs.com/lavaclient-queue-plugin)

Have you made any plugins? If so, open a [pull-request](https://github.com/Lavaclient/lavaclient/pulls).

```ts
import { Manager, Plugin, Player } from "lavaclient";

class MyPlugin extends Plugin {
  onJoin(player: Player) {
    console.log(`New Player: ${player.guildId}`);
  }
}

Manager.use(new MyPlugin());
```

## Example usage

The only setup example as of right now is for `discord.js`.

```ts
import { Manager } from "lavaclient";
import { Client } from "discord.js";

const nodes = [
  {
    name: "main",
    address: "localhost",
    password: "youshallnotpass",
    port: 2333,
    ws: {}, // if you want to pass options to the websocket.
  },
];

const client = new Client();
const manager = new Manager(nodes, {
  send: (id, payload) => {
    const guild = client.guilds.cache.get(id);
    if (guild) return guild.shard.send(payload);
    return;
  },
});

client.on("ready", async () => await manager.init(client.user.id));
client.ws.on("VOICE_SERVER_UPDATE", (pk) => manager.serverUpdate(pk));
client.ws.on("VOICE_STATE_UPDATE", (pk) => manager.stateUpdate(pk));
```

### Joining & Leaving

```ts
const player = await manager.join({
  guild: "696355996657909790",
  channel: "696359398708215848",
});

await manager.leave("696355996657909790");
```

### Extending Player & Socket

```ts
import { Player, Manager } from "lavaclient";

class CustomPlayer extends Player {
  bassboost(level) {
    this.equalizer([
      {
        band: 0,
        gain: 1,
      },
      {
        band: 1,
        gain: 0.75,
      },
    ]);
  }
}

const manager = new Manager([], {
  player: CustomPlayer,
});
```

```ts
import { Socket, Manager } from "lavaclient";

class CustomSocket extends Socket {
  constructor(...args) {
    super(...args);

    console.log("Socket Initalization.");
  }
}

const manager = new Manager([], {
  socket: CustomSocket,
});
```

## Contributers

- [MeLike2D](https://github.com/lolwastedjs)
- [Chroventer](https://github.com/chroventer)

## Links

- [GitHub](https://github.com/Lavaclient/lavaclient)
- [NPM](https://npmjs.com/package/lavaclient)
- [Documentation](https://lavaclient.js.org)
