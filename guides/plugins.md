## Plugins

> In Version 3 plugins have once changed but they aren't very different.

### Official Plugins

- [Lavaclient REST](https://npmjs.com/lavaclient-rest)
- [Lavaclient Queue](https://npmjs.com/lavaclient-queue)

### Creating Your Own

#### Typescript

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

#### JavaScript

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