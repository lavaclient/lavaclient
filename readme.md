# LavaClient

[![discord server][discord]](https://discord.gg/vuJxnYk) &bull; [![codacy rating][codacy]](https://www.codacy.com/gh/Lavaclient/lavaclient?utm_source=github.com&utm_medium=referral&utm_content=Lavaclient/lavaclient&utm_campaign=Badge_Grade) &bull; [![npm version][version]](https://npmjs.com/lavaclient)

A simple, easy-to-use, and flexible node.js lavalink client.

- **Flexible**: Lavaclient can be used with any discord library for node.js. Each class can be changed relatively easily, making lavaclient completely customizable.
- **Plugins**: Provides a simple plugin class that can be loaded by the Manager, see the plugin guide.
- **Easy-to-use**: LavaClient has a neat and user-friendly promise-based api.
- **Lightweight**: Designed to be small and performant, it's a great choice for any sized project.

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

[discord]: https://discordapp.com/api/guilds/733105160628469793/embed.png
[codacy]: https://api.codacy.com/project/badge/Grade/fe049eb85ee74900ae764fc5af6a6299
[version]: https://img.shields.io/npm/v/lavaclient.svg?maxAge=3600

---

[MeLike2D](https://melike2d.me/) &copy; 2020
