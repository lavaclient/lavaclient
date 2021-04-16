# LavaClient

[![discord server][discord]](https://discord.gg/vuJxnYk) &bull; [![codacy rating][codacy]](https://www.codacy.com/gh/Lavaclient/lavaclient?utm_source=github.com&utm_medium=referral&utm_content=Lavaclient/lavaclient&utm_campaign=Badge_Grade) &bull; [![npm version][version]](https://npmjs.com/lavaclient)

A simple, easy-to-use, and flexible node.js lavalink client.

- **Flexible**: LavaClient doesn't depend on a specific Discord library. Each class can be changed relatively easily, allowing everything to be customized.
- **Plugins**: Provides a simple `Plugin` class that the Manager can load, you can view the [Plugins Guide](https://lavaclient.js.org/guide/plugins.html) for a basic implementation.
- **Easy-to-use**: LavaClient has a neat and user-friendly promise-based api.
- **Performant**: Designed to be small and performant, it's a great choice for any sized project.

## Installation

> node.js v14 or newer needed.

```sh
npm install lavaclient
# or
yarn add lavaclient
```

## Usage

> Documentation: <https://lavaclient.js.org/> *outdated (join our [support server](https://discord.gg/vuJxnYk) for updates)*

```ts
import LavaClient from "lavaclient";

const nodes = [
  {
    id: "My Node",
    host: "localhost",
    port: 3000,
    password: "lavaclient-is-amazing"
  }
]

const manager = new LavaClient.Manager(nodes, {
  send(id, payload) {
    sendPayloadToDiscord()
    // check out our guides for an eris and discord.js example.
  }
});

await manager.init("your client id.");

// Use these two methods when receiving voice state and server updates.
await manager.stateUpdate(<update>);
await manager.serverUpdate(<update>);
```

## Bot Showcase

> Here's a few bots that use Lavaclient in production!

- [Stereo](https://top.gg/bot/725808086933176410) by [@Sxmurai](https://github.com/Sxmurai)

If you'd like your bot listed just join our discord and ask `2D#5773`!

---

[discord]: https://discordapp.com/api/guilds/733105160628469793/embed.png
[codacy]: https://api.codacy.com/project/badge/Grade/fe049eb85ee74900ae764fc5af6a6299
[version]: https://img.shields.io/npm/v/lavaclient.svg?maxAge=3600

[melike2d](https://github.com/melike2d) &copy; 2020
