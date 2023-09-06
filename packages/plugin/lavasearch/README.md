# LavaSearch Integration Plugin

> A [Lavalink API client](https://npmjs.com/lavalink-api-client) plug-in for better integration with [LavaSearch](https://github.com/Topi314/LavaSearch)

## 🛟 Need Support?

Feel free to join our [Discord Server](https://discord.gg/8R4d8RydT4).

## ⛓️ Example

Requires **LavaSearch v1**

```ts
import "@lavaclient/plugin-lavasearch/register";

// 1.
await node.api.loadSearch("spsearch:Odetari", "track", "artist", "album");

// 2.
await node.api.loadSearchOrNull("spsearch:Odetari", "track", "artist", "album");
```

1. Loads a LavaSearch result with tracks, artists, and albums. Throws an exception if nothing was found.
2. Does the same thing as 1 but returns null if nothing was found.
