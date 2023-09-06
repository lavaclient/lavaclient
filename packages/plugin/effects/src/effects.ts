import type * as Protocol from "lavalink-protocol";
import type { Player } from "lavaclient";
import type { Writable } from "ts-essentials";

import { map } from "./tools.js";

export interface PlayerEffect {
    id: string;
    filters: Protocol.Filters;
}

type filtersObject = Writable<Protocol.Filters> & {
    pluginFilters: Record<string, unknown>;
};

export class PlayerEffectManager {
    private readonly effects: Map<string, Protocol.Filters>;

    constructor(readonly player: Player) {
        this.effects = new Map();
    }

    /**
     * All of the enabled effects for this player.
     */
    get all(): Iterable<PlayerEffect> {
        return map(this.effects.entries(), ([id, filters]) => ({ id, filters }) satisfies PlayerEffect);
    }

    /**
     * The number of active effects for this player.
     */
    get active(): number {
        return this.effects.size;
    }

    /**
     * Whether the player has any effects enabled.
     */
    get isEmpty(): boolean {
        return this.active === 0;
    }

    /**
     * Clears all enabled effects.
     * @returns Whether any effects were cleared.
     */
    async clear() {
        if (this.isEmpty) {
            return false;
        }

        this.effects.clear();
    }

    /**
     * Toggles the provided {@link PlayerEffect}.
     * @param effect The effect to toggle.
     */
    async toggle(effect: PlayerEffect) {
        const enable = !this.effects.has(effect.id);
        if (enable) {
            const filters = this.getFilterTypes(effect);
            [...this.all]
                .filter((it) => this.getFilterTypes(it).some((it) => filters.includes(it)))
                .forEach((it) => this.effects.delete(it.id));

            this.effects.set(effect.id, effect.filters);
        } else {
            this.effects.delete(effect.id);
        }

        await this.apply();
        return enable;
    }

    /**
     * Applies the current effects to the player.
     */
    async apply() {
        var filters: filtersObject = {
            pluginFilters: {},
        };

        for (const value of map(this.all, (it) => it.filters)) {
            const { pluginFilters, ...data } = value;
            filters = Object.assign(filters, data);
            filters.pluginFilters = Object.assign(filters.pluginFilters, pluginFilters);
        }

        await this.player.setFilters(filters);
    }

    toJSON() {
        return [...this.all];
    }

    private getFilterTypes(effect: PlayerEffect) {
        return Object.keys(effect.filters);
    }
}
