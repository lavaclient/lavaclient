# LavaClient Setup

[Eris](#eris) &bull; [DiscordJS](#discordjs)

## discord.js

```ts
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

## eris

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

---

[MeLike2D](https://melike2d.me) &copy; 2020
