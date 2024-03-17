import { Player } from "lavaclient";
import { PlayerEffectManager } from "./effects.js";

const kEffects: unique symbol = Symbol.for("Player#effects");

/**
 *
 */
export const load = () => {
    Reflect.defineProperty(Player.prototype, "effects", {
        get(this: Player) {
            return (this[kEffects] ??= new PlayerEffectManager(this));
        },
    });
};

declare module "lavaclient" {
    interface Player {
        /**
         * The player's effect manager, used to conveniently manage filters.
         */
        readonly effects: PlayerEffectManager;

        /** @internal */
        [kEffects]: PlayerEffectManager;
    }
}
