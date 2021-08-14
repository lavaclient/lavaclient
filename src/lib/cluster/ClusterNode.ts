import { Node } from "../node/Node";

import type { Cluster } from "./Cluster";
import type { ConnectionInfo } from "../node/Connection";

export class ClusterNode extends Node {
    constructor(readonly cluster: Cluster, readonly id: string, info: ConnectionInfo) {
        super({ sendGatewayPayload: cluster.sendGatewayPayload, connection: info });
    }
}
