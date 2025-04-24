import { ApiEndpoints, ErrorCodes, GuildsStatsData, InteractionData, LocaleData, TrackGuildType } from "./utils/types";
import fetch from "node-fetch";

/**
 * DiscordAnalytics Base Class
 * @class AnalyticsBase
 * @description Base class for DiscordAnalytics
 * @param {string} api_key - The API key for DiscordAnalytics
 * @param {boolean} debug - Optional flag to enable debug mode /!\ MUST BE USED ONLY FOR DEBUGGING PURPOSES
 * @returns {AnalyticsBase} - An instance of the AnalyticsBase class
 * @example
 * const analytics = new AnalyticsBase('YOUR_API_KEY');
 * analytics.sendStats('YOUR_CLIENT_ID', 0, 0);
 * const customEvent = analytics.events('my_custom_event');
 * customEvent.increment(1);
 * analytics.trackGuilds(guild, 'create');
 */
export default class AnalyticsBase {
  private readonly _api_key: string;
  private readonly _headers: { 'Content-Type': string; Authorization: string; };
  public debug: boolean = false;
  public stats_data = {
    date: new Date().toISOString().slice(0, 10),
    guilds: 0,
    users: 0,
    interactions: [] as InteractionData[],
    locales: [] as LocaleData[],
    guildsLocales: [] as LocaleData[],
    guildMembers: {
      little: 0,
      medium: 0,
      big: 0,
      huge: 0,
    },
    guildsStats: [] as GuildsStatsData[],
    addedGuilds: 0,
    removedGuilds: 0,
    users_type: {
      admin: 0,
      moderator: 0,
      new_member: 0,
      other: 0,
      private_message: 0,
    },
    custom_events: {} as Record<string, number>,
  };

  constructor(api_key: string, debug: boolean = false) {
    this._api_key = api_key;
    this.debug = debug;
    this._headers = {
      'Content-Type': 'application/json',
      Authorization: `Bot ${this._api_key}`,
    };
  }

  /**
   * Custom events
   * /!\ Advanced users only
   * /!\ You need to initialize the class first
   * @param event_key - The event key to track
   * @returns {CustomEvent} - The CustomEvent instance
   * @example
   * const event = analytics.events('my_custom_event');
   * event.increment(1);
   * event.decrement(1);
   * event.set(10);
   */
  public events(event_key: string): CustomEvent {
    if (this.debug) console.debug(`[DISCORDANALYTICS] Getting event ${event_key}`);

    if (typeof event_key !== 'string') throw new Error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_VALUE_TYPE}`);

    return new CustomEvent(this, event_key);
  }

  public updateOrInsert<T>(
    array: T[],
    match: (item: T) => boolean,
    update: (item: T) => void,
    insert: () => T,
  ): void {
    const item = array.find(match);
    if (item) update(item);
    else array.push(insert());
  }

  public calculateGuildMembers(guildMembers: number[]): { little: number; medium: number; big: number; huge: number } {
    return guildMembers.reduce((acc, count) => {
      if (count <= 100) acc.little++;
      else if (count <= 500) acc.medium++;
      else if (count <= 1500) acc.big++;
      else acc.huge++;
      return acc;
    }, { little: 0, medium: 0, big: 0, huge: 0 });
  }

  /**
   * Track guilds
   * /!\ Advanced users only
   * /!\ You need to initialize the class first
   * @param guild - The Guild instance only
   * @param {TrackGuildType} type - "create" if the event is guildCreate and "delete" if is guildDelete
   */
  public trackGuilds(guild: any, type: TrackGuildType): void {
    if (this.debug) console.log(`[DISCORDANALYTICS] trackGuilds(${type}) triggered`);
    if (type === 'create') this.stats_data.addedGuilds++;
    else this.stats_data.removedGuilds++;
  }

  public async api_call_with_retries(
    method: string,
    url: string,
    body: string,
    max_retries: number = 5,
    backoff_factor: number = 0.5,
  ) {
    let retries = 0;
    let response: fetch.Response;

    while (retries < max_retries) {
      try {
        response = await fetch(url, {
          method,
          headers: this._headers,
          body,
        });

        if (response.ok) return response;
        else if (response.status === 401) return console.error(ErrorCodes.INVALID_API_TOKEN);
        else if (response.status === 423) return console.error(ErrorCodes.SUSPENDED_BOT);
        else if (response.status !== 200) return console.error(ErrorCodes.INVALID_RESPONSE);
      } catch (error) {
        retries++;
        const retry_after = Math.pow(2, retries) * backoff_factor;
        if (this.debug) console.error(`[DISCORDANALYTICS] Error: ${error}. Retrying in ${retry_after} seconds...`);
        if (retries >= max_retries) throw error;
        await new Promise((resolve) => setTimeout(resolve, retry_after * 1000));
      }
    }
  }

  public async sendStats(
    client_id: string,
    guild_count: 0,
    user_count: 0,
    guild_members: number[] = [],
  ): Promise<void> {
    if (this.debug) console.debug('[DISCORDANALYTICS] Sending stats...');

    const method = 'POST';
    const url = `${ApiEndpoints.BASE_URL}${ApiEndpoints.EDIT_STATS_URL.replace(':id', client_id)}`;
    const body = JSON.stringify(this.stats_data);

    await this.api_call_with_retries(method, url, body);

    if (this.debug) console.debug(`[DISCORDANALYTICS] Stats ${body} sent to the API`);

    this.stats_data = {
      date: new Date().toISOString().slice(0, 10),
      guilds: guild_count,
      users: user_count,
      interactions: [],
      locales: [],
      guildsLocales: [],
      guildMembers: this.calculateGuildMembers(guild_members),
      guildsStats: [],
      addedGuilds: 0,
      removedGuilds: 0,
      users_type: {
        admin: 0,
        moderator: 0,
        new_member: 0,
        other: 0,
        private_message: 0,
      },
      custom_events: {},
    }
  }
}

export class CustomEvent {
  private readonly _analytics: AnalyticsBase;
  private readonly _event_key: string;

  constructor(analytics: AnalyticsBase, event_key: string) {
    this._analytics = analytics;
    this._event_key = event_key;
  }

  private ensure() {
    if (this._analytics.debug) console.debug(`[DISCORDANALYTICS] Ensuring event ${this._event_key} exists`);

    if (this._analytics.stats_data.custom_events[this._event_key] === undefined) {
      this._analytics.stats_data.custom_events[this._event_key] = 0;
    }
  }

  public increment(value: number): void {
    if (this._analytics.debug) console.debug(`[DISCORDANALYTICS] Incrementing event ${this._event_key} by ${value}`);

    if (typeof value !== 'number') throw new Error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_VALUE_TYPE}`);

    if (value < 0) throw new Error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_EVENTS_COUNT}`);

    this.ensure();
    this._analytics.stats_data.custom_events[this._event_key] += value;
  }

  public decrement(value: number): void {
    if (this._analytics.debug) console.debug(`[DISCORDANALYTICS] Decrementing event ${this._event_key} by ${value}`);

    if (typeof value !== 'number') throw new Error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_VALUE_TYPE}`);

    if (value < 0) throw new Error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_EVENTS_COUNT}`);

    this.ensure();
    this._analytics.stats_data.custom_events[this._event_key] -= value;
  }

  public set(value: number): void {
    if (this._analytics.debug) console.debug(`[DISCORDANALYTICS] Setting event ${this._event_key} to ${value}`);

    if (typeof value !== 'number') throw new Error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_VALUE_TYPE}`);

    if (value < 0) throw new Error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_EVENTS_COUNT}`);

    this.ensure();
    this._analytics.stats_data.custom_events[this._event_key] = value;
  }
}
