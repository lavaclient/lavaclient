# LavaClient Players

> In this guide you'll learn how to create and destroy players, and play music with a player.

## Creating a Player

```js
const player = await manager.create(guild.id);

// lets connect
await player.connect(<VoiceChannel>.id, { selfDeaf: true });
```

## Destroying a Player

```js
/** Way 1: Manager */
await manager.destroy("guild id here");

/** Way 2: Player */
// lets provide true for the "disconnect" parameter, this disconnects from the voice channel.
await player.destroy(true);
```

## Playing Music

> Lets search for some good ol' G-Eazy Music.

*ps: this assumes you have access to a player.*

```js
const results = await player.manager.search("ytsearch:G-eazy - In The Middle");
if (!results || !results.tracks.length) return;

const { track, info } = results.tracks[0]
await player.play(track);

console.log(`Now Playing: ${info.title} by ${info.author}`);
```

---

[MeLike2D](https://melike2d.me) &copy; 2020

