import { Socket } from "./structures/Socket";
import { Player } from "./structures/Player";

export class Structures {
  private static structures: Classes = {
    player: Player,
    socket: Socket,
  };

  /**
   * Extend the specified structure.
   * @param name The structure to extend.
   * @param extend The extender function.
   * @since 2.0.0
   */
  public static extend<K extends keyof Classes, E extends Classes[K]>(
    name: K,
    extend: (base: Classes[K]) => E
  ): E {
    const extended = extend(this.structures[name]);
    return (this.structures[name] = extended);
  }

  /**
   * Get the specified structure.
   * @param name The structure to get.
   * @since 2.0.0
   */
  public static get<K extends keyof Classes>(name: K): Classes[K] {
    return this.structures[name];
  }
}

/**
 * A typescript helper decorator for extending structures.
 * @param name The name of the structure to extend.
 * @constructor
 */
export function Extend<K extends keyof Classes>(name: K) {
  return <T extends Classes[K]>(target: T): T => {
    return Structures.extend(name, () => target);
  };
}

export interface Classes {
  socket: typeof Socket;
  player: typeof Player;
}
