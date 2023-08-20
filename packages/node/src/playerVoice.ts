import type * as Protocol from "lavalink-protocol";

import { DiscordResource, Emitter, Snowflake, getId } from "./tools.js";
import { Player } from "./player.js";

export class PlayerVoice extends Emitter<PlayerVoiceEvents> {
    /**
     * The ID of the Voice Channel this player is connected to.
     */
    channelId: string | null = null;

    /**
     * Whether this player is connected to a voice channel.
     */
    connected = false;

    /**
     * The latency of the voice connection.
     */
    latency = -1;

    /**
     * The voice server information, or `null` if not connected.
     */
    server: Protocol.VoiceState | null = null;

    private voiceUpdate: Partial<{ event: { token: string; endpoint: string }; sessionId: string }> = {};

    constructor(readonly player: Player) {
        super();
    }

    /**
     * Connects to the specified voice channel.
     *
     * @param channel The channel to connect to.
     * @param options The options for connecting to the channel.
     */
    connect(channel: Snowflake | DiscordResource | null, options: ConnectOptions = {}): this {
        this.voiceUpdate = {};

        const channelId = channel && getId(channel);
        this.player.node.emit("debug", {
            system: "player",
            subsystem: "voice",
            message: `updating voice status in guild=${this.player.id}, channel=${channelId}`,
            player: this.player,
        });

        // send update voice status command
        this.player.node.options.discord.sendGatewayCommand(this.player.id, {
            op: 4,
            d: {
                guild_id: this.player.id,
                channel_id: channelId,
                self_deaf: options.deafened ?? false,
                self_mute: options.muted ?? false,
            },
        });

        return this;
    }

    /**
     * Disconnects from the current voice channel.
     */
    disconnect() {
        return this.connect(null);
    }

    /**
     * Handles a voice update from Discord.
     */
    async handleVoiceUpdate(update: VoiceStateUpdate | VoiceServerUpdate): Promise<boolean> {
        if ("token" in update) {
            this.voiceUpdate.event = update;
        } else {
            if (update.user_id !== this.player.node.userId) {
                return false;
            }

            const channel = update.channel_id;
            if (!channel && this.channelId) {
                this.emit("channelLeave", this.channelId);
                this.channelId = null;
                this.voiceUpdate = {};
            } else if (channel && !this.channelId) {
                this.channelId = update.channel_id;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.emit("channelJoin", this.channelId!);
            } else if (channel !== this.channelId) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.emit("channelMove", this.channelId!, update.channel_id!);
                this.channelId = update.channel_id;
            }

            if (this.voiceUpdate.sessionId === update.session_id) {
                return false;
            }

            this.voiceUpdate.sessionId = update.session_id;
        }

        if (this.voiceUpdate.event && this.voiceUpdate.sessionId) {
            this.player.node.emit("debug", {
                system: "player",
                subsystem: "voice",
                message: "submitting voice update to node.",
                player: this.player,
            });

            /* update the player and patch any data. */
            const data = await this.player.api.update({
                voice: {
                    ...this.voiceUpdate.event,
                    sessionId: this.voiceUpdate.sessionId,
                },
            });

            this.player.patch(data);
        }

        return true;
    }
}

export type PlayerVoiceEvents = {
    channelJoin: (joined: Snowflake) => void;
    channelLeave: (left: Snowflake) => void;
    channelMove: (from: Snowflake, to: Snowflake) => void;
};

export interface ConnectOptions {
    /**
     * Whether to join deafened.
     */
    deafened?: boolean;

    /**
     * Whether to join muted.
     */
    muted?: boolean;
}

export interface VoiceServerUpdate {
    token: string;
    endpoint: string;
    guild_id: `${bigint}`;
}

export interface VoiceStateUpdate {
    session_id: string;
    channel_id: `${bigint}` | null;
    guild_id: `${bigint}`;
    user_id: `${bigint}`;
}
