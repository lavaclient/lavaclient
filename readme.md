<div align="center">
	<h1>LavaClient</h1>
	<a href="https://discord.gg/BnQECNd"><img src="https://discordapp.com/api/guilds/696355996657909790/embed.png" alt="discord"/><a>
	<a href="https://www.codacy.com/gh/Lavaclient/lavaclient?utm_source=github.com&utm_medium=referral&utm_content=Lavaclient/lavaclient&utm_campaign=Badge_Grade"><img src="https://api.codacy.com/project/badge/Grade/fe049eb85ee74900ae764fc5af6a6299" alt="code quality"/><a>
	<a href="https://npmjs.com/lavaclient"><img src="https://img.shields.io/npm/v/lavaclient.svg?maxAge=3600" alt="version"/><a>
</div>

A simple, easy-to-use, and flexible node.js lavalink client.

- **Flexible**: Lavaclient can be used with any discord library for node.js. Includes extendable structures like Player and Socket, making lavalink completely customizable.
- **Plugins**: Provides a simple plugin class that can be loaded by the Manager, see the plugin guide.
- **Easy-to-use**: LavaClient has a neat and user-friendly promise-based api.
- **Lightweight**: Designed to be as light as possible, using only a few classes and dependencies.
- **Flexible**: The easy-to-use plugins and structures system makes lavaclient completely modular and allow you to customize everything.

Our Guides: <https://github.com/Lavaclient/lavaclient/tree/master/guides>

## Installation

> node.js v12 or newer needed.

```sh
npm install lavaclient
# or
yarn add lavaclient
```

## Usage

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
```

---

[MeLike2D](https://melike2d.me/) &copy; 2020