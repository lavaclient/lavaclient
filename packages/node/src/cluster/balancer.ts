/*
 * Copyright 2023 Dimensional Fun & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Node } from "../node.js";
import type { Cluster } from "./client.js";
import type { ClusterNode } from "./node.js";
import type { PenaltyProvider } from "./penalty.js";

export type LoadBalancerFactory = (cluster: Cluster) => LoadBalancer;

/**
 * The default load balancer factory.
 */
export const DefaultLoadBalancer: LoadBalancerFactory = (cluster, penaltyProviders: Array<PenaltyProvider> = []) => {
    const available = () => [...cluster.nodes.values()].filter((it) => it.ws.active);
    const penalties = (node: ClusterNode) =>
        node.penalties.calculate() + penaltyProviders.reduce((acc, it) => acc + it.calculate(node), 0);

    return {
        next: () => {
            const nodes = available();
            /* if there's one or fewer nodes then choose the first index. */
            if (nodes.length <= 1) {
                return nodes[0] ?? null;
            }

            /* calculate penalty counts */
            return nodes.sort((a, b) => penalties(a) - penalties(b))[0] ?? null;
        },
    };
};

/**
 * A load balancer is responsible for choosing the next node to use.
 */
export interface LoadBalancer {
    /**
     * @returns The next node to use, or `null` if no nodes are available.
     */
    next: () => Node | null;
}

export const nextOrThrow = (lb: LoadBalancer) => {
    const node = lb.next();
    if (!node) throw new Error("No nodes available");
    return node;
};

