<img src="https://i.imgur.com/LvsojLc.png" align="center">

> A lightweight and powerful [lavalink](https://github.com/freyacodes/lavalink) client for nodejs.

- **Easy-to-use:** lavaclient has a neat and user-friendly promise-based api.
- **Performant:** designed to be small and lightweight, it's a great choice for any project.
- **Library Agnostic:** lavaclient doesn't require you to use a specific discord library. Use anything you want!

[**Support Server**](https://discord.gg/GQgM5pbJWm)

<h1 align="center">Installation</h1>

[Node.js v16.11.0](https://nodejs.org) or newer is required

##### Stable

```shell
yarn add lavaclient # or npm install
```

##### Beta (may be outdated)

```shell
yarn add lavaclient@beta # or npm install
```

##### Deno

If you're looking for a [Deno](https://deno.land) variant of lavaclient... We've got you covered!!

- **Lavadeno:** <https://github.com/lavaclient/lavadeno>

<h2 align="center">Usage</h2>

### Setup

Even though the following examples use import syntax, Lavaclient also supports CommonJS!

```ts
import { Cluster, Node } from "lavaclient";

const info = { host: "localhost", port: 2333, password: "youshallnotpass" };

const lavalink = new Node({
    connection: info,
    sendGatewayPayload: (id, payload) => sendWithDiscordLib(id, payload),
});

// or for clustering:

const lavalink = new Cluster({
    nodes: [ { id: "main", ...info } ],
    sendGatewayPayload: (id, payload) => sendWithDiscordLib(id, payload),
});

lavalink.connect("870267613635309618");
```

### Handling Voice Updates

Lavalink requires voice updates to play audio in a voice channel, this may vary from library to library.

What you need for correctly sending voice updates to lavalink:

1. A connection to the Discord gateway.
2. [**Raw** Voice _State_ and _Server_ updates](https://discord.com/developers/docs/topics/gateway#voice)
3. Passing the data of the voice update to `(Cluster|Node)#handleVoiceUpdate`

- [discord.js v13 example](https://github.com/lavaclient/djs-v13-example)

### Playing Music

```ts
const results = await lavalink.rest.loadTracks(
    "ytsearch:never gonna give you up",
);

await lavalink
    .createPlayer("830616783199010857")
    .connect("830638203739308053")
    .play(results.tracks[0]);
```

<sub>this is a very poor way of playing music btw... checkout our [discord.js example](https://github.com/lavaclient/djs-v13-example)</sub>

---

Need some more help? Join our [**Support Server**](https://discord.gg/GQgM5pbJWm)

[![Rate this package](https://badges.openbase.com/js/rating/lavaclient.svg?token=7xbXCE61YwbjuEPTGbWP9q9GXQStpvuXdzoYBVY6i1k=)](https://openbase.com/js/lavaclient?utm_source=embedded&amp;utm_medium=badge&amp;utm_campaign=rate-badge)

---

[lavaclient](https://lavaclient.js.org/) &copy; 2018 - 2022
