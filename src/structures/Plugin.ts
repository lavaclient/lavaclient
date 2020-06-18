import { Manager } from "./Manager";

/**
 * A plugin class used for making Lavaclient Plugins.
 */
export abstract class Plugin {
  /**
   * The manager that loaded this plugin.
   */
  public manager: Manager;

  /**
   * Called when this plugin is loaded.
   * @param manager The manager that loaded this plugin.
   */
  public load(manager: Manager): void {
    this.manager = manager;
    return;
  }

  /**
   * Called when the manager is initialized.
   * @since 2.0.0
   */
  public init(): void {
    return;
  }
}