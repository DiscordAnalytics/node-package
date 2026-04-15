import { ApiEndpoints, ErrorCodes, StatsData, TrackGuildType } from './types';

/**
 * DiscordAnalytics Base Class
 * @class AnalyticsBase
 * @description Base class for DiscordAnalytics
 * @param {string} api_key The API key for DiscordAnalytics
 * @param {boolean} debug Optional flag to enable debug mode /!\ MUST BE USED ONLY FOR DEBUGGING PURPOSES
 * @returns {AnalyticsBase} An instance of the AnalyticsBase class
 * @example
 * const analytics = new AnalyticsBase('YOUR_API_KEY');
 * analytics.sendStats('YOUR_CLIENT_ID', 0, 0);
 */
export class AnalyticsBase {
  private readonly _api_key: string;
  private readonly _headers: { 'Content-Type': string; Authorization: string };
  private readonly debug_mode: boolean = false;
  public readonly _api_url: string;
  public stats_data: StatsData = {
    date: new Date().toISOString().slice(0, 10),
    addedGuilds: 0,
    customEvents: {},
    guilds: [],
    guildCount: 0,
    guildLocales: [],
    guildMembers: {
      little: 0,
      medium: 0,
      big: 0,
      huge: 0,
    },
    interactions: [],
    interactionLocales: [],
    removedGuilds: 0,
    userCount: 0,
    userInstallCount: 0,
    usersType: {
      admin: 0,
      moderator: 0,
      newMember: 0,
      other: 0,
      privateMessage: 0,
    },
  };
  public client_id: string = '';

  constructor(api_key: string, api_url: string = ApiEndpoints.BASE_URL, debug: boolean = false) {
    this._api_key = api_key;
    this._api_url = api_url;
    this.debug_mode = debug;
    this._headers = {
      'Content-Type': 'application/json',
      Authorization: `Bot ${this._api_key}`,
    };
  }

  public debug(...args: unknown[]): void {
    if (this.debug_mode) console.debug(...args);
  }

  public error(content: unknown, exit: boolean = false): void {
    console.error(content);
    if (exit) process.exit(1);
  }

  /**
   * Custom events
   * /!\ Advanced users only
   * /!\ You need to initialize the class first
   * @param event_key The event key to track
   * @returns {CustomEvent} The CustomEvent instance
   * @example
   * const event = analytics.events('my_custom_event');
   * event.increment(1);
   * event.decrement(1);
   * event.set(10);
   */
  public events(event_key: string): CustomEvent {
    this.debug(`[DISCORDANALYTICS] Getting event ${event_key}`);

    if (typeof event_key !== 'string')
      throw new Error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_VALUE_TYPE}`);

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

  public calculateGuildMembers(guildMembers: number[]): {
    little: number;
    medium: number;
    big: number;
    huge: number;
  } {
    return guildMembers.reduce(
      (acc, count) => {
        if (count <= 100) acc.little++;
        else if (count <= 500) acc.medium++;
        else if (count <= 1500) acc.big++;
        else acc.huge++;
        return acc;
      },
      { little: 0, medium: 0, big: 0, huge: 0 },
    );
  }

  /**
   * Track guilds
   * /!\ Advanced users only
   * /!\ You need to initialize the class first
   * @param {TrackGuildType} type 'create' if the event is guildCreate and 'delete' if is guildDelete
   */
  public trackGuilds(type: TrackGuildType): void {
    this.debug(`[DISCORDANALYTICS] trackGuilds(${type}) triggered`);
    if (type === 'create') this.stats_data.addedGuilds++;
    else this.stats_data.removedGuilds++;
  }

  /**
   * API call with retries
   * @param method The HTTP method to use (GET, POST, PUT, DELETE)
   * @param url The URL to call
   * @param body The body to send (optional)
   * @param max_retries The maximum number of retries (default: 5)
   * @param backoff_factor The backoff factor to use (default: 0.5)
   * @returns {Promise<void | Response>} The response from the API
   */
  public async api_call_with_retries(
    method: string,
    endpoint: string,
    body?: string,
    max_retries: number = 5,
    backoff_factor: number = 0.5,
  ): Promise<void | Response> {
    let retries = 0;
    let response: Response;

    while (retries < max_retries) {
      try {
        response = await fetch(this._api_url + endpoint, {
          method,
          headers: this._headers,
          body,
        });

        if (response.ok) return response;
        else if (response.status === 401)
          return this.error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_API_TOKEN}`);
        else if (response.status === 423)
          return this.error(`[DISCORDANALYTICS] ${ErrorCodes.SUSPENDED_BOT}`);
        else if (response.status === 404 && endpoint.includes('events'))
          return this.error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_EVENT_KEY}`, true);
        else if (response.status !== 200)
          return this.error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_RESPONSE}`);
      } catch (error) {
        retries++;
        const retry_after = Math.pow(2, retries) * backoff_factor;
        this.error(`[DISCORDANALYTICS] Error: ${error}. Retrying in ${retry_after} seconds...`);
        if (retries >= max_retries)
          return this.error(`[DISCORDANALYTICS] ${ErrorCodes.MAX_RETRIES_EXCEEDED}`);
        await new Promise((resolve) => setTimeout(resolve, retry_after * 1000));
      }
    }
  }

  public async updateBotInformations(
    username: string,
    framework: string,
    version: string,
    avatar: string | null,
  ): Promise<void> {
    const url = ApiEndpoints.EDIT_SETTINGS_URL.replace('{id}', this.client_id);
    const body = JSON.stringify({
      avatar,
      framework,
      username,
      version,
    });
    await this.api_call_with_retries('PATCH', url, body);
  }

  /**
   * Send stats to the API
   * @param client_id The client ID of the bot
   * @param guild_count The number of guilds the bot is in (default: 0)
   * @param user_count The number of users the bot is in (default: 0)
   * @param user_install_count The number of user installs (default: 0)
   * @param guild_members The number of members in each guild (optional)
   * @returns {Promise<void>} A promise that resolves when the stats are sent
   */
  public async sendStats(
    client_id: string,
    guild_count: number = 0,
    user_count: number = 0,
    user_install_count: number = 0,
    guild_members: number[] = [],
  ): Promise<void> {
    this.debug('[DISCORDANALYTICS] Sending stats...');

    const url = ApiEndpoints.EDIT_STATS_URL.replace('{id}', client_id);
    const body = JSON.stringify(this.stats_data);

    await this.api_call_with_retries('POST', url, body);

    this.debug('[DISCORDANALYTICS] Stats sent to the API', body);

    this.stats_data = {
      date: new Date().toISOString().slice(0, 10),
      addedGuilds: 0,
      customEvents: this.stats_data.customEvents,
      guilds: [],
      guildCount: guild_count,
      guildLocales: [],
      guildMembers: this.calculateGuildMembers(guild_members),
      interactions: [],
      interactionLocales: [],
      removedGuilds: 0,
      userCount: user_count,
      userInstallCount: user_install_count,
      usersType: {
        admin: 0,
        moderator: 0,
        newMember: 0,
        other: 0,
        privateMessage: 0,
      },
    };
  }
}

/**
 * CustomEvent class
 * @class CustomEvent
 * @description Class for custom events
 * @param {AnalyticsBase} analytics The AnalyticsBase instance
 * @param {string} event_key The event key to track
 * @returns {CustomEvent} An instance of the CustomEvent class
 * @example
 * const event = analytics.events('my_custom_event');
 * event.increment(1);
 * event.decrement(1);
 * event.set(10);
 * event.get();
 */
export class CustomEvent {
  private readonly _analytics: AnalyticsBase;
  private readonly _event_key: string;
  private _last_action: string;

  constructor(analytics: AnalyticsBase, event_key: string) {
    this._analytics = analytics;
    this._event_key = event_key;
    this._last_action = '';

    this.ensure();
  }

  private async ensure() {
    if (
      typeof this._analytics.stats_data.customEvents[this._event_key] !== 'number' &&
      process.env.NODE_ENV === 'production'
    ) {
      this._analytics.debug(`[DISCORDANALYTICS] Fetching value for event ${this._event_key}`);
      const url = ApiEndpoints.EVENT_URL.replace('{id}', this._analytics.client_id).replace(
        '{event}',
        this._event_key,
      );
      const res = await this._analytics.api_call_with_retries('GET', url);

      if (res instanceof Response && this._last_action !== 'set') {
        const data: { today_value?: number } = await res.json();
        this._analytics.stats_data.customEvents[this._event_key] =
          (this._analytics.stats_data.customEvents[this._event_key] || 0) + (data.today_value || 0);
      }
      this._analytics.debug(`[DISCORDANALYTICS] Value fetched for event ${this._event_key}`);
    }
  }

  /**
   * Increment the event by a value
   * @param value The value to increment the event by (default: 1)
   */
  public increment(value: number = 1): void {
    this._analytics.debug(`[DISCORDANALYTICS] Incrementing event ${this._event_key} by ${value}`);

    if (typeof value !== 'number')
      throw new Error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_VALUE_TYPE}`);

    if (value < 0) throw new Error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_EVENTS_COUNT}`);

    this._analytics.stats_data.customEvents[this._event_key] =
      (this._analytics.stats_data.customEvents[this._event_key] || 0) + value;
    this._last_action = 'increment';
  }

  /**
   * Decrement the event by a value
   * @param value The value to decrement the event by (default: 1)
   */
  public decrement(value: number = 1): void {
    this._analytics.debug(`[DISCORDANALYTICS] Decrementing event ${this._event_key} by ${value}`);

    if (typeof value !== 'number')
      throw new Error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_VALUE_TYPE}`);

    if (value < 0 || this.get() - value < 0)
      throw new Error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_EVENTS_COUNT}`);

    this._analytics.stats_data.customEvents[this._event_key] -= value;
    this._last_action = 'decrement';
  }

  /**
   * Set the event to a value
   * @param value The value to set the event to
   */
  public set(value: number): void {
    this._analytics.debug(`[DISCORDANALYTICS] Setting event ${this._event_key} to ${value}`);

    if (typeof value !== 'number')
      throw new Error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_VALUE_TYPE}`);

    if (value < 0) throw new Error(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_EVENTS_COUNT}`);

    this._analytics.stats_data.customEvents[this._event_key] = value;
    this._last_action = 'set';
  }

  /**
   * Get the event value
   * @returns {number} The event value
   */
  public get(): number {
    this._analytics.debug(`[DISCORDANALYTICS] Getting event ${this._event_key}`);

    return this._analytics.stats_data.customEvents[this._event_key];
  }
}

export * from './types';
