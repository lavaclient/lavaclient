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

export interface PenaltyProvider {
    /**
     * Calculates the penalty count for the given node.
     */
    calculate: (node: Node) => number;
}

/**
 * Penalty calculation courtesy of:
 * <https://github.com/duncte123/lavalink-client/blob/main/src/main/kotlin/dev/arbjerg/lavalink/internal/loadbalancing/Penalties.kt>  
 * License: <https://github.com/duncte123/lavalink-client/blob/main/LICENSE>
 */
export class Penalties {
    tracksStuck = 0;

    tracksFailed = 0;

    loadsFailed = 0;

    loadsAttempted = 0;

    constructor(readonly node: Node) {}

    clear() {
        this.tracksStuck = 0;
        this.tracksFailed = 0;
        this.loadsFailed = 0;
        this.loadsAttempted = 0;
    }

    calculate() {
        const stats = this.node.ws.stats;
        if (!this.node.ws.active || !stats) {
            return Number.MAX_SAFE_INTEGER;
        }

        /*  */
        if (this.loadsAttempted > 0 && this.loadsAttempted === this.loadsFailed) {
            return Number.MAX_SAFE_INTEGER;
        }

        /*  */
        let penalties = 0;
        penalties += stats.playingPlayers; // active player count
        penalties += 1.05 ** (stats.cpu.systemLoad * 100) * 10 - 10; // cpu load

        if (stats.frameStats) {
            const calc = (n: number) => 1.03 ** ((n / 3000) * 500) * 600 - 600;
            penalties += calc(stats.frameStats.deficit); //
            penalties += calc(stats.frameStats.nulled) * 2; //
        }

        penalties += this.tracksStuck * 100 - 100;
        penalties += this.tracksFailed * 100 - 100;
        penalties += this.loadsFailed > 0 ? this.loadsFailed / this.loadsAttempted : 0;

        /* return calculated penalty count. */
        return penalties;
    }
}
