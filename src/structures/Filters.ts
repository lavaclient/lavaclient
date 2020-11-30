import type { Player } from "./Player";
import type {
  EqualizerFilter,
  Filters as FilterMap,
  KaraokeFilter,
  TimescaleFilter,
  TremoloFilter,
  VolumeFilter
} from "@lavaclient/types";

export class Filters implements FilterMap {
  /**
   * The default volume configuration
   */
  public static DEFAULT_VOLUME: VolumeFilter = 1;

  /**
   * The default configuration for timescale..
   */
  public static DEFAULT_TIMESCALE: TimescaleFilter = {
    rate: 1,
    speed: 1,
    pitch: 1
  }

  /**
   * The default karaoke configuration.
   */
  public static DEFAULT_KARAOKE: KaraokeFilter = {
    level: 1,
    monoLevel: 1,
    filterBand: 220,
    filterWidth: 100
  }

  /**
   * The default tremolo configuration.
   */
  public static DEFAULT_TREMOLO: TremoloFilter = {
    depth: .5,
    frequency: 2
  }

  /**
   * The player this filters instance is for..
   */
  public readonly player: Player;

  /**
   * The timescale filter.
   * @private
   */
  public timescale?: TimescaleFilter | null;

  /**
   * The karaoke filter.
   * @private
   */
  public karaoke?: KaraokeFilter | null;

  /**
   * The equalizer filter.
   * @private
   */
  public equalizer: EqualizerFilter;

  /**
   * The volume filter.
   * @private
   */
  public volume: VolumeFilter;

  /**
   * The tremolo filter.
   */
  public tremolo: TremoloFilter | null;

  /**
   * @param player The player instance.
   */
  public constructor(player: Player) {
    this.player = player;

    this.volume = 1;
    this.equalizer = [];
    this.tremolo = null;
    this.karaoke = null;
    this.timescale = null;
  }

  /**
   * Whether the equalizer filter is enabled.
   * Checks if any of the provided bans doesn't have a gain of 0.0, 0.0 being the default gain.
   */
  public get isEqualizerEnabled(): boolean {
    return this.equalizer.some(band => band.gain !== 0.0);
  }

  /**
   * Whether the tremolo filter is enabled or not.
   * Checks if it's null or the depth does not equal 0.0.
   */
  public get isTremoloEnabled(): boolean {
    return !!this.tremolo && this.tremolo.depth !== 0.0;
  }

  /**
   * Whether the karaoke filter is enabled or not.
   * Checks if the karaoke property does not equal null.
   */
  public get isKaraokeEnabled(): boolean {
    return !!this.karaoke;
  }

  /**
   * Whether the timescale filter is enabled.
   * Checks if the property does not equal and if any of it's properties doesn't equal 1.0
   */
  public get isTimescaleEnabled(): boolean {
    return !!this.timescale && Object.values(this.timescale).some(v => v !== 1.0);
  }

  /**
   * The filters payload.
   */
  public get payload(): FilterMap {
    const payload: FilterMap = {
      volume: this.volume,
      equalizer: this.equalizer
    }

    if (this.isTimescaleEnabled) {
      payload.timescale = this.timescale;
    }

    if (this.isKaraokeEnabled) {
      payload.karaoke = this.karaoke;
    }

    if (this.isTremoloEnabled) {
      payload.tremolo = this.tremolo;
    }

    return payload;
  }

  /**
   * Applies the filters to the player.
   * @param prioritize Whether to prioritize the payload.
   */
  public apply(prioritize = false): this {
    this.player.send("filters", this.payload, prioritize);
    return this;
  }
}
