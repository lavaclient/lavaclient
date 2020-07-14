<div align="center">
	<h1>LavaClient</h1>
	<a href="https://discord.gg/BnQECNd"><img src="https://discordapp.com/api/guilds/696355996657909790/embed.png" alt="discord"/><a>
	<a href="https://www.codacy.com/gh/Lavaclient/lavaclient?utm_source=github.com&utm_medium=referral&utm_content=Lavaclient/lavaclient&utm_campaign=Badge_Grade"><img src="https://api.codacy.com/project/badge/Grade/fe049eb85ee74900ae764fc5af6a6299" alt="code quality"/><a>
	<a href="https://npmjs.com/lavaclient"><img src="https://img.shields.io/npm/v/lavaclient.svg?maxAge=3600" alt="version"/><a>
</div>

> Lavaclient: A simple, easy-to-use, and flexible lavalink client that be used with any discord library with no caveats.

- **📦 Lightweight**:  Clean and optimized code leaves lavaclient with a small memory footprint.
- **🔰 Simplistic**: Lavaclient has been designed to be dead simple and highly beginner friendly.
- **🔋 Flexible**: The easy-to-use plugins and structures system makes lavaclient completely modular and allow you to customize everything.

[Discord](https://discord.gg/BnQECNd) &middot; [Github](https://github.com/lavaclient/lavaclient) &middot; [NPM](https://npmjs.com/lavaclient)

---

```sh
npm install lavaclient
```

## Bots

Popular Bots that Use LavaClient:

**None**

*Want to add yours? Make a [pull-request]() with examples, or DM **2D#5773** on Discord!*

## Usage

> For support please join our discord server: <https://discord.gg/BnQECNd>

In most of these examples it's assuming you're using discord.js, but it should work fine with any node.js discord lib.

### Setup

Djs:

```js
// Import our dependencies, so in this case discord.js and lavaclient.
const { Client } = require("discord.js");
const { Manager } = require("lavaclient");

// Create our nodes array.
const nodes = [
  {
    id: "main",
    host: "localhost",
    port: 2333,
    password: "youshallnotpass",
  },
];

// Create our client and manager.
const client = new Client();
const manager = new Manager(nodes, {
  // The shard count must be 1 or greater, or lavalink would break.
  shards: 1,

  // Send payloads to discord.
  // Note: If you're doing this inside of a class, use an arrow function.
  send(id, data) {
    const guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(data);
    return;
  }
});

client.on("ready", async () => {
  // lets initialize our manager. This connects to all of the given lavalink nodes.
  await manager.init(client.user.id);
  console.log("ready");
});

// add our listeners, There are two more like "socketClose" and "socketDisconnect".
manager.on("socketError", ({ id }, error) => console.error(`${id} ran into an error`, error));
manager.on("socketReady", (node) => console.log(`${node.id} connected.`));

// Lets make sure we're supplying voice updates to lavaclient.
client.ws.on("VOICE_STATE_UPDATE", (upd) => manager.stateUpdate(upd));
client.ws.on("VOICE_SERVER_UPDATE", (upd) => manager.serverUpdate(upd));

// Lets Login into Discord.
client.login("your token you should always keep secure *cough* *cough*")
```

Eris:

```ts
// Import our dependencies, so in this case eris and lavaclient.
const { Client } = require("eris");
const { Manager } = require("lavaclient");

// Create our nodes array.
const nodes = [
  {
    id: "main",
    host: "localhost",
    port: 2333,
    password: "youshallnotpass",
  },
];

// Create our client and manager.
const client = new Client("your token you should always keep secure *cough* *cough*");
const manager = new Manager(nodes, {
  // The shard count must be 1 or greater, or lavalink would break.
  shards: 1,

  // Send payloads to discord.
  // Note: If you're doing this inside of a class, use an arrow function.
  send(id, data) {
    const guild = client.guilds.get(id);
    if (guild) guild.shard.sendWS(data.op, data.d, false);
    return;
  }
});

client.on("ready", async () => {
  // lets initialize our manager. This connects to all of the given lavalink nodes.
  await manager.init(client.user.id);
  console.log("ready");
});

// add our listeners, There are two more like "socketClose" and "socketDisconnect".
manager.on("socketError", ({ id }, error) => console.error(`${id} ran into an error`, error));
manager.on("socketReady", (node) => console.log(`${node.id} connected.`));

// Lets make sure we're supplying voice updates to lavaclient.
client.on("rawWS", async (pk) => {
  // lets only check dispatch packets.
  if (pk.op === 0) {
    if (pk.t === "VOICE_SERVER_UPDATE") {
      await manager.serverUpdate(pk.d);
    } else if (pk.t === "VOICE_STATE_UPDATE") {
      await manager.stateUpdate(pk.d);
    }
  } else return;
});

// Lets Connect our Client.
client.connect()
```

### Creating Players and Disconnecting Them

>  Lets create our first player, assuming you have access to the manager, a discord guild, and voice channel.

```js
const player = await manager.create(guild.id);

// lets connect
await player.connect(<VoiceChannel>.id, { selfDeaf: true });
```

> Lets disconnect this player.

```js
await player.disconnect();

// and if we wanted to remove the player from the player map.
await player.disconnect(true);
```

### Searching and Playing Music...

> Lets search for some good ol' G-Eazy Music.

*ps: this assumes you have access to a player.*

```js
const results = await player.manager.search("ytsearch:G-eazy - In The Middle");
if (!results || !results.tracks.length) return;

const { track, info } = results.tracks[0]
await player.play(track);

console.log(`Now Playing: ${info.title} by ${info.author}`);
```

### Destroying Players

> Lets destroy a player, assuming you have access to the manager or a player.

```js
/** Way 1: Manager */
await manager.destroy("guild id here");

/** Way 2: Player */
// lets provide true for the "disconnect" parameter, this disconnects from the voice channel.
await player.destroy(true);
```

## Plugins

> In Version 3 plugins have once changed but they aren't very different.

#### Official Plugins

- [Lavaclient REST](https://npmjs.com/lavaclient-rest)
- [Lavaclient Queue](https://npmjs.com/lavaclient-queue)

### Creating Your Own

```ts
import { Plugin, Structures } from "lavaclient";

// Lets create a plugin that adds a track array to the Player.
class MyPlugin extends Plugin {
  public load() {
    // here we use Structures.get for the class we're extending so plugins wont conflict with each other
    class MyPlayer extends Structures.get("player") {
      public tracks: string[] = [];

      public add(track: string) {
        this.tracks.push(track);
      }
    }

    Structures.extend("player", () => MyPlayer);
  }
}

// Lets use our plugin, assuming you have access to the one you created.
// note: if your plugin uses the "init" method, this should be ran before you run Manager#init()
manager.use(new MyPlugin());
```

Or for JavaScript users:

> *note:* this example also works in typescript but with ES6 imports instead.

```js
const { Structures, Plugin } = require("lavaclient");

class MyPlugin extends Plugin {
  load() {
    Structures.extend("player", (Player) =>
      class MyPlayer extends Player {
        constructor(socket, data) {
          super(socket, data);
          this.tracks = [];
        }

        add(track) {
          this.tracks.push(track);
        }
      }
    );
  }
}

manager.use(new MyPlugin());
```

---

[MeLike2D](https://melike2d.me/) &copy; 2020