import { Client, GatewayDispatchEvents } from "discord.js";
import { Node } from "lavaclient";

const client = new Client({
    intents: ["Guilds", "GuildVoiceStates"],
});

const node = new Node({
    info: {
        auth: "youshallnotpass",
        host: "localhost",
        port: 8080,
    },
    discord: {
        sendGatewayCommand: (id, data) => client.guilds.cache.get(id)?.shard?.send(data),
    },
});

node.on("debug", (event) => {
    console.debug(`[${event.system}${"subsystem" in event ? `:${event.subsystem}` : ""}] ${event.message}`);
});

node.ws.on("ready", async () => {
    const result = await node.api.loadTracks("ytsearch:Odetari - I LOVE YOU HOE");

    const player = node.players.create(process.env.TEST_GUILD!);
    player.on("trackStart", (track) => {
        console.log("started playing", track.info.title, "by", track.info.author)
    });

    player.voice.connect(process.env.TEST_CHANNEL!);

    await player.play(result.loadType === "search" ? result.data[0] : "");
});

node.rest.on("request", (event) => {
    const msg: unknown[] = ["[rest]", event.prepared.request.method, event.prepared.url.pathname];
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

client.on("ready", async (client) => {
    node.connect(client.user.id);
});

client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, u => node.players.handleVoiceUpdate(u))
client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, u => node.players.handleVoiceUpdate(u))

client.login(process.env.TEST_TOKEN);
