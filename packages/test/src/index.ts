import { Client, GatewayDispatchEvents } from "discord.js";
import { Cluster } from "lavaclient";

import "@lavaclient/plugin-lavasearch/register";
import "@lavaclient/plugin-effects/register";
import "@lavaclient/plugin-queue/register";
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
            rest: {

            },
            ws: {
                reconnecting: {
                    tries: Infinity

                },

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

node.once("ready", async () => {

    const player = node.players.create(process.env.TEST_GUILD!);
    player.on("trackStart", (track) => {
        console.log("started playing", track.info.title, "by", track.info.author);
        // console.log(getUserData(track, userDataSchema))
    });

    player.voice.disconnect()
    player.voice.connect(process.env.TEST_CHANNEL!);

    const loadAndQueue = async (query: string) => {
        const result = await node.api.loadSearch("spsearch:" + query, "album");
        console.log(result.albums);
        // player.queue.add(result.tracks[0], {
            // requester: "123",
        // });
    }


    await loadAndQueue("heylog gravel");
    await loadAndQueue("surround sound jid baby tate");

    await player.queue.start();

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
    node.connect({ userId: client.user.id });
});

client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (u) => node.players.handleVoiceUpdate(u));
client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (u) => node.players.handleVoiceUpdate(u));

client.login(process.env.TEST_TOKEN);
