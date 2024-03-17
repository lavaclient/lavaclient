import { ClusterNode, Player } from "lavaclient";
import { Queue, QueueOptions, Song } from "./queue";

const kQueue = Symbol.for("queue");

export const QUEUE_OPTIONS: QueueOptions = {
    play: async (queue, song) => void (await queue.player.play(song.encoded)),
};

/**
 *
 */
export const load = () => {
    Reflect.defineProperty(Player.prototype, "queue", {
        get(this: Player) {
            return (this[kQueue] ??= new Queue(this, QUEUE_OPTIONS));
        },
    });
};

declare module "lavaclient" {
    interface Player {
        readonly queue: Queue;

        /** @internal */
        [kQueue]: Queue;
    }

    interface ClusterEvents {
        nodeQueueCreate: (node: ClusterNode, queue: Queue) => void;
        nodeQueueFinish: (node: ClusterNode, queue: Queue) => void;
        nodeTrackStart: (node: ClusterNode, queue: Queue, song: Song) => void;
        nodeTrackEnd: (node: ClusterNode, queue: Queue, song: Song) => void;
    }

    interface NodeEvents {
        queueCreate: (queue: Queue) => void;
        queueFinish: (queue: Queue) => void;
        trackStart: (queue: Queue, song: Song) => void;
        trackEnd: (queue: Queue, song: Song) => void;
    }
}
