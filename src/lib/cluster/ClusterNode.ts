import { Node, NodeEvents } from "../node/Node";

import type { Cluster, ClusterEvents } from "./Cluster";
import type { ConnectionInfo } from "../node/Connection";

export class ClusterNode extends Node {
    constructor(readonly cluster: Cluster, readonly id: string, info: ConnectionInfo) {
        super({ sendGatewayPayload: cluster.sendGatewayPayload, connection: info });
    }

    emit<U extends keyof NodeEvents>(event: U, ...args: Parameters<NodeEvents[U]>): boolean {
        const _event = `node${event.replace(/(\b\w)/, i => i.toUpperCase())}` as keyof ClusterEvents;
        if (this.cluster.listenerCount(_event)) {
            // @ts-expect-error Fuck off lmfao
            this.cluster.emit(_event, this, ...args);
        }

        return super.emit(event, ...args);
    }
}
