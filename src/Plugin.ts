import { Socket, Player } from "./index";
import { Manager } from "./Manager";

export class Plugin {
  public constructor(public manager: Manager) {}

  public onLoad(): any {
    throw new Error(`${this.constructor.name}#onLoad hasn't been implemented.`);
  };

  public onNewSocket(socket: Socket): any {
    throw new Error(`${this.constructor.name}#onNewSocket hasn't been implemented.`);
  };
  
  public onPlayerSummon(player: Player): any {
    throw new Error(`${this.constructor.name}#onPlayerSummon hasn't been implemented.`);
  };
}
