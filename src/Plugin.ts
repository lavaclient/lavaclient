import { Socket, Player } from ".";
import { Manager } from "./Manager";
import { SocketOptions } from "./Socket";

export abstract class Plugin {
  public manager: Manager;
  public abstract onLoad(): any;
  public abstract onNewSocket(_socket: Socket, _options: SocketOptions): any;
  public abstract onPlayerSummon(_player: Player): any;
}
