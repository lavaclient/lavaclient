import { Node } from "./Node";

import type { Cluster } from "../Cluster";
import type { ConnectionInfo } from "./Connection";

export class ClusterNode extends Node {
    readonly cluster: Cluster;
    readonly id: string;

    constructor(cluster: Cluster, id: string, info: ConnectionInfo) {
        super({ sendGatewayPayload: cluster.sendGatewayPayload, connection: info });

        this.cluster = cluster;
        this.id = id;
    }
}
