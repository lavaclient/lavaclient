# lavaclient &middot; [![Discord](https://discordapp.com/api/guilds/696355996657909790/embed.png)](https://discord.gg/BnQECNd) [![Version](https://img.shields.io/npm/v/lavaclient.svg?maxAge=3600)](https://npmjs.com/lavaclient) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/fe049eb85ee74900ae764fc5af6a6299)](https://www.codacy.com/gh/Lavaclient/lavaclient?utm_source=github.com&utm_medium=referral&utm_content=Lavaclient/lavaclient&utm_campaign=Badge_Grade)

> Lavaclient is a simple, easy-to-use, and flexible lavalink client that can be used with any discord library.

- 📦 **Lightweight**: Modular to the core, no forced features or bloat. Less then 400 lines of clean and optimized code.
- 🔰 **Simplistic**: Lavaclient is designed to be simple and highly beginner friendly and flexible for any use case.
- 🔋 **Flexible**: Our easy-to-use and powerful plugins system allow you to customize every single part of lavaclient with no caveats.

```bash
npm install lavaclient
```

## Plugins

Have you made any plugins? If so, make a [pull request](https://github.com/lavaclient/lavaclient/pulls).

- [Lavaclient REST](https://npmjs.com/lavaclient-rest)
- [Lavaclient Queue](https://npmjs.com/lavaclient-queue)

## Usage

> In this example we're using discord.js but it should work with any other library you choose.

```js
const { Client } = require("discord.js");
const { Manager } = require("lavaclient");

const nodes = [
  {
    name: "main",
    host: "localhost",
    port: 2333,
    password: "youshallnotpass",
  },
];

const client = new Client();
const manager = new Manager(nodes, {
  send(id, payload) {
    const guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(payload);
  }
});

/** Provide voice updates to lavaclient. */
client.ws.on("VOICE_SERVER_UPDATE", (pk) => manager.serverUpdate(pk));
client.ws.on("VOICE_STATE_UPDATE", (pk) => manager.stateUpdate(pk));

/** Initalize the Manager */
client.on("ready", async () => {
  console.log("Bot is now ready!");

  await manager.init(client.user.id);
  manager.on("open", (name) => console.log(name, "is now open"));
  manager.on("close", (name) => console.log(name, "was disconnected from lavalink."));
  manager.on("error", (error) => console.error(error));
});
```

### Joining, Leaving, and Playing

```js
const player = await manager.join({
  guild: "guild id**",
  channel: "voice channel id**"
}, { deafen: false, mute: false });

await player.play("base64 track string");
player.on("end", () => manager.leave(player.guild))
```

### Plugins - Structures

> Note: This is written in typescript for greater support, but javascript should work...

In version 2 of lavaclient the plugins system has changed completely.
The "Extend" decorator used in this example will NOT work in Javascript, for javascript users please use Structures#extend(), It works the same as DiscordJS's structures.

```ts
import { Extend, Structures, Plugin, Manager } from "lavaclient";

declare module "lavaclient" {
  interface Player {
    skip(): Promise<void>;
  }
}

class MyPlugin extends Plugin {
  public preRegister() {
    @Extend("player")
    class MyPlayer extends Structures.get("player") { // I recommend using Structures#get for this part so plugins can be seemless.
      // Lets say this is adds a bunch of queue functionality.
      public async skip() {
        await this.stop();
        console.log("Skipped the last playing song.");
      }
    }
  }
}

Manager.use(new MyPlugin());

// And now there's a skip method that we can use globally.
```

---

[MeLike2D](https://melike2d.me) &copy; 2020
