<img src="https://i.imgur.com/LvsojLc.png" align="center">

> A lightweight and powerful lavalink client for nodejs.
 
- **Easy-to-use:** lavaclient has a neat and user-friendly promise-based api.
- **Performant:** designed to be small and lightweight, it's a great choice for any project. 
- **Library Independent:** lavaclient doesn't lock you into a specific discord library. Use anything you want!

[**Support Server**](https://discord.gg/CH9ubGPMV6)

<h1 align="center">Installation</h1>

[node.js lts](https://nodejs.org) or newer is required

##### Stable

```shell
yarn add lavaclient # or npm install
```

##### Beta

```shell
yarn add lavaclient@beta # or npm install
```

<h2 align="center">Usage</h2>

### Setup

```ts
import { Node, Cluster } from "lavaclient";

const info = { host: "localhost", port: 2333, password: "youshallnotpass" }

const lavalink = new Node({
    connection: info,
    sendGatewayPayload: (id, payload) => sendWithDiscordLib(id, payload)
});

// or for clustering:

const lavalink = new Cluster({
    nodes: [ { id: "main", ...info } ],
    sendGatewayPayload: (id, payload) => sendWithDiscordLib(id, payload)
});

lavalink.connect("870267613635309618");
```

### Handling Voice Updates

Lavalink requires voice updates to play audio in a voice channel, this may vary from library to library.

What you need for correctly sending voice updates to lavalink:

1. A connection to the Discord gateway.
2. [**Raw** Voice *State* or *Server* updates](https://discord.com/developers/docs/topics/gateway#voice)
3. Passing the data of the voice update to `(Cluster|Node)#handleVoiceUpdate`

- [discord.js v13 example](https://github.com/lavaclient/djs-v13-example)

### Playing Music

```ts
const results = await lavalink.rest.loadTracks("ytsearch:never gonna give you up");

await lavalink
    .createPlayer("830616783199010857")
    .connect("830638203739308053")
    .play(results.tracks[0]);
```

<sub>this is a very poor way of playing music btw...</sub>

---

Need some more help? Join our [**Support Server**](https://discord.gg/CH9ubGPMV6)

<h2 align="center">Deno</h2>

If you're looking for a [Deno](https://deno.land) variant of lavaclient... I've got you covered!!

- **Lavadeno:** <https://github.com/lavaclient/lavadeno>

---

[melike2d](dimensional.fun) &copy; 2018 - 2021

