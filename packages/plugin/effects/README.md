<img src="https://github.com/lavaclient/.github/raw/main/assets/banner.png" align="center">

> A [lavaclient](https://npmjs.com/lavaclient) plugin for better filter management.

## ⛓️ Example

```ts
import type { PlayerEffect } from "@lavaclient/effects";

const nightcore: PlayerEffect = {
    id: "nightcore",
    filters: [
        {
            type: "timescale",
            data: { rate: 1.125, pitch: 1, speed: 1 },
        },
    ],
};

await player.effects.toggle(nightcore);
```
