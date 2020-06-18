
# lavaclient &middot; [![Discord](https://discordapp.com/api/guilds/696355996657909790/embed.png)](https://discord.gg/BnQECNd) [![Version](https://img.shields.io/npm/v/lavaclient.svg?maxAge=3600)](https://npmjs.com/lavaclient) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/fe049eb85ee74900ae764fc5af6a6299)](https://www.codacy.com/gh/Lavaclient/lavaclient?utm_source=github.com&utm_medium=referral&utm_content=Lavaclient/lavaclient&utm_campaign=Badge_Grade)

> Lavaclient: A simple, easy-to-use, and flexible lavalink client that be used with any discord library with no caveats.

- **📦 Lightweight**:  Clean and optimized code leaves lavaclient with a small memory footprint.
- **🔰 Simplistic**: Lavaclient has been designed to be dead simple and highly beginner friendly.
- **🔋 Flexible**: The easy-to-use plugins and structures system makes lavaclient completely modular and allow you to customize everything.

[Discord](https://discord.gg/BnQECNd) &middot; [Github](https://github.com/lavaclient/lavaclient) &middot; [NPM](https://npmjs.com/lavaclient)

---

```sh
npm install lavaclient
```

## Usage

> In these examples we're using discord.js but with a few changes it should work with anything you choose.

For support please join our discord server: <https://discord.gg/BnQECNd>

### Setup

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
const manager = new Manager(nodes , {
	// The shard count must be 1 or greater, or lavalink itself would break.
	shards: 1,
	// Send payloads to discord.
	send(id, data) {
		const guild = client.guilds.cache.get(id);
		if (guild) guild.shard.send(data);
		return;
	}
});

client.on("ready", async () => {
	// Initalize our manager, this will create all of the node connections.
	await manager.init(client.user.id);
	// Now to add our listeners.
	manager.on("socketError", ({id}, error) => console.error(`${id} ran into an error`, error);
	manager.on("socketReady", (node) => console.log(`${node.is} connected.`));
	// There are two more like "socketClose" and "socketDisconnect"
});

client.login("your token you should always keep secure *cough* *cough*")
```

### Creating Players

>  Lets create our first player, assuming you have access to the manager, a guild and guild member.

```js
/** Way 1: Auto Connect */

const player = await manager.create({
	guild: guild.id,
	channel: member.voice.channel.id
}, { selfDeaf: true, selfMute: false });

/** Way 2: Manual Connect */

const player = await manager.create({ guild: guild.id }, { noConnect: true });
// later maybe?
await player.connect(<VoiceChannel>.id, { selfDeaf: true });
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
import { Extend, Player, Structures, Manager } from "lavaclient";

// Lets create a plugin that adds a track array to the Player.
class MyPlugin extends Plugin {
	public load() {
		// here we use Structures.get for the class we're extending so plugins wont conflict with each other
		@Extend("player")
		class MyPlayer extends Structures.get("player") {
			public tracks: string[] = [];

			public add(track: string) {
				this.tracks.push(track);
			}
		}
	}
}
// Lets use our plugin, assuming you have access to the one you created. note: if your plugin uses the "init" method, this should be ran before you run Manager#init()
manager.use(new MyPlugin());
```

Or Javascript (this also works in typescript):

```js
const { Structures, Manager, Plugin } = require("lavaclient");

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
