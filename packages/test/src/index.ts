import { Client, GatewayDispatchEvents } from "discord.js";
import { S, Cluster, getUserData } from "lavaclient";

import "@lavaclient/plugin-lavasearch/register";
import "@lavaclient/plugin-effects/register";
import { PlayerEffect } from "@lavaclient/plugin-effects";

const client = new Client({
    intents: ["Guilds", "GuildVoiceStates"],
});

const node = new Cluster({
    nodes: [
        {
            info: {
                auth: "youshallnotpass",
                host: "localhost",
                port: 8080,
            },
            ws: {
                reconnecting: { tries: Infinity },
            },
        },
    ],
    discord: {
        sendGatewayCommand: (id, data) => client.guilds.cache.get(id)?.shard?.send(data),
    },
});

const nightcore: PlayerEffect = {
    id: "nightcore",
    filters: {
        timescale: { rate: 1.123456789 },
    },
};

const slowed: PlayerEffect = {
    id: "slowed",
    filters: {
        timescale: { rate: 0.75 },
    },
};

const userDataSchema = S.struct({
    requesterId: S.string
})

node.once("ready", async () => {
    const result = await node.api.loadSearch("spsearch:i love you hoe odetari", "track");
    console.log(result)

    const player = node.players.create(process.env.TEST_GUILD!);
    player.on("trackStart", (track) => {
        console.log("started playing", track.info.title, "by", track.info.author);
    });

    player.voice.connect(process.env.TEST_CHANNEL!);

    await player.play({
        encoded: result.tracks[0].track,
        userData: { requesterId: "123" },
        userDataSchema
    });

    await player.effects.toggle(nightcore);
    await player.effects.toggle(slowed);
});

node.on("nodeDebug", (node, event) => {
    console.debug(
        `[${node.identifier}]`,
        `[${event.system}${"subsystem" in event ? `:${event.subsystem}` : ""}] ${event.message}`,
    );
});

node.on("nodeRequest", (node, event) => {
    const msg: unknown[] = [
        `[${node.identifier}]`,
        "[rest]",
        event.prepared.request.method,
        event.prepared.url.pathname,
    ];

    if (event.type === "error") {
        msg.push("!");
        if (event.finished) msg.push(event.took.toFixed(2), "ms");
        msg.push(`(${event.reason}):`, event.cause);
    } else {
        msg.push(event.type === "fail" ? "-" : "+", event.took.toFixed(2), "ms");
        if (event.type === "fail") msg.push(event.error);
    }

    console.log(...msg);
});

node.on("nodeReady", async (node, event) => {
    if (event.resumed) {
        // player most likely still exists.
        return;
    }

    for (const [_, player] of node.players.cache) player.transfer(node);
});

client.on("ready", async (client) => {
    console.log("connected to discord.");
    node.connect(client.user.id);
});

client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (u) => node.players.handleVoiceUpdate(u));
client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (u) => node.players.handleVoiceUpdate(u));

client.login(process.env.TEST_TOKEN);
