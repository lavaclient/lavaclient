<img src="https://i.imgur.com/LvsojLc.png" align="center">

> A lightweight and powerful [lavalink v4](https://github.com/lavalink-devs/lavalink) client for NodeJs.

-   **Easy-to-use:** lavaclient has a neat and user-friendly promise-based api.
-   **Performant:** designed to be small and lightweight, it's a great choice for any project.
-   **Library Agnostic:** lavaclient doesn't require you to use a specific discord library. Use anything you want!

## Installation

Node.js LTS (or higher) is required to use lavaclient.

#### Stable

```sh
(p)npm install lavaclient
// or
yarn add lavaclient
```

#### Beta (may be outdated)

```sh
(p)npm install lavaclient@next
// or
yarn add lavaclient@next
```

#### Deno

Take a look at [lavadeno](https://github.com/lavaclient/lavadeno) :)

## Usage

### Setup

```ts
import { Cluster, Node, type NodeOptions } from "lavaclient";

const info: NodeOptions["info"] = {
    host: "127.0.0.1",
    port: 2333,
    auth: "youshallnotpass"
}

// If you only have a single lavalink node, use the `Node` class.
const lavaclient = new Node({
    info,
    ws: {
        // The client name to use, defaults to some very long string lol.
        clientName: "my very cool bot",
        // Resuming is enabled by default, but you can disable it if you want.
        // The timeout defaults to 1 minute.
        resuming: false | { timeout: 30_000 },
        // The reconnecting options, this is enabled by default.
        // If you want to disable it, set it to `false`.
        reconnecting: {
            // The number of tries to reconnect before giving up, defaults to Infinity.
            tries: 3,
            // The delay in milliseconds between each attempt, defaults to 5 seconds.
            // This can either be a function that accepts the current try and returns the delay, or a static delay.
            delay: (attempt) => attempt * 1_000
        }
    },
    rest: {
        // Whether lavalink should return stack traces for requests that ran into exceptions.
        enableTrace: true,
        // The fetch implementation to use, defaults to node.js built-in fetch.
        fetch: fetch,
        // The user agent to use for requests, defaults to some very long string lol.
        userAgent: "my very cool bot (v1.0.0, <user id>)"
    },
    discord: {
        sendGatewayCommand: (id, payload) => // Send the payload to the Discord Gateway.
    }
});

// If you have multiple lavalink nodes, use the `Cluster` class.
const lavaclient = new Cluster({
    // An array of lavalink node options, this supports the same thing as the `Node` class.
    nodes: [{ info }],
    discord: {
        sendGatewayCommand: (id, payload) => // Send the payload to the Discord Gateway.
    }
});

// Connect to the lavalink node(s).
await lavaclient.connect("1077037369850605599");
```

## Using Players

#### Creation

```ts
const player = lavaclient.players.create("<guild id>");
```

#### Destruction

```ts
// Passing `true` as the 2nd arg will skip checking if the player exists locally.
await lavaclient.players.destroy("<guild id>", true);
```

If you want a player to leave the voice channel, you can do this first:

```ts
player.voice.disconnect();
```

#### Playing Tracks

```ts
import { S, getUserData } from "lavaclient";

const results = await lavaclient.api.loadTracks("ytsearch:never gonna give you up");
if (results.loadType === "search") {
    const track = results.data[0];

    // You can pass a track object directly.
    await player.play(track);

    // If you want to pass some user data to the track, you can do this:
    await player.play({
        encoded: track.encoded,
        userData: { requesterId: interaction.user.id },
    });

    // There's also an option to pass a user data schema for type-safe user data values.
    const schema = S.struct({
        requesterId: S.string,
    });

    await player.play({
        encoded: track.encoded,
        userData: { requesterId: interaction.user.id },
        userDataSchema: schema,
    });

    getUserData(player.track, schema); // { requesterId: string }
}
```

#### Misc

```ts
player.resume()
player.pause()

player.setFilters({ volume: 0.5 });
player.setFilters("volume", 0.5);

player.seek(1000);
player.stop();

// A little experimental but you can transfer a player to a different node.
player.transfer(lavaclient2)
```

## Handling Voice Updates

Lavalink requires you to forward [voice server & state](https://discord.com/developers/docs/topics/gateway#voice) updates to it so that it can connect to the voice channel.

Here's a discord.js v14 example:

```ts
import { Client, GatewayDispatchEvents } from "discord.js";

const client = new Client({ ... });

client.ws.on(GatewayDispatchEvents.VoiceStateUpdate,  (u) => lavaclient.players.handleVoiceUpdate(u));
client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (u) => lavaclient.players.handleVoiceUpdate(u));
```

[**Support Server**](https://discord.gg/GQgM5pbJWm)
