import { EventsToTrack, ErrorCodes, ApiEndpoints, Locale, InteractionType } from '../utils/types';
import axios from 'axios';

/**
 * @class DiscordAnalytics
 * @description The Discord.js class for the DiscordAnalytics library.
 * @param {Object} options - Configuration options.
 * @property {any} options.client - The Discord.js client to track events for.
 * @property {EventsToTrack} options.eventsToTrack - An object specifying which events to track.
 * @property {string} options.apiToken - The API token for DiscordAnalytics.
 * @property {boolean} options.sharded - Whether the Discord.js client is sharded.
 * @example
 * const { EventsToTrack } = require('discord-analytics');
 * const DiscordAnalytics = require('discord-analytics/discordjs').default;
 * const { Client } = require('discord.js');
 * const client = new Client();
 * client.on('ready', () => {
 *   const analytics = new DiscordAnalytics({
 *     client: client,
 *     eventsToTrack: {
 *       trackGuilds: true,
 *       trackGuildsLocale: true,
 *       trackInteractions: true,
 *       trackUserCount: true,
 *       trackUserLanguage: true
 *     },
 *     apiToken: 'YOUR_API_TOKEN',
 *     sharded: false
 *   });
 *   analytics.trackEvents();
 * });
 * client.login('YOUR_BOT_TOKEN');
 */
export default class DiscordAnalytics {
  private readonly _client: any;
  private readonly _eventsToTrack: EventsToTrack;
  private readonly _apiToken: string;
  private _headers: { 'Content-Type': string; Authorization: string; };
  private _sharded: boolean = false;

  constructor(options: {client: any, eventsToTrack: EventsToTrack, apiToken: string, sharded: boolean }) {
    this._client = options.client;
    this._eventsToTrack = options.eventsToTrack;
    this._apiToken = options.apiToken;
    this._headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bot ${this._apiToken}`
    }
    this._sharded = options.sharded || false;
  }

  /**
   * @description Track events
   * @returns {void}
   */
  public async trackEvents(): Promise<void> {
    if (!this._eventsToTrack.trackInteractions && !this._eventsToTrack.trackGuilds && !this._eventsToTrack.trackUserCount && !this._eventsToTrack.trackUserLanguage && !this._eventsToTrack.trackGuildsLocale) throw new Error(ErrorCodes.INVALID_EVENTS_COUNT);

    axios.patch(`${ApiEndpoints.BASE_URL}${ApiEndpoints.EDIT_SETTINGS_URL.replace(':id', this._client.user!.id)}`, {
      username: this._client.user!.username,
      avatar: this._client.user!.avatar,
      framework: "discord.js",
      settings: this._eventsToTrack
    }, {
      headers: this._headers
    }).then(async r => {
      if (r.status === 401) throw new Error(ErrorCodes.INVALID_API_TOKEN);
      if (r.status === 423) throw new Error(ErrorCodes.SUSPENDED_BOT);
      if (r.status !== 200) throw new Error(ErrorCodes.INVALID_RESPONSE);

      let data = {
        date: new Date().toISOString().slice(0, 10),
        guilds: this._sharded ? ((await (this._client.shard?.broadcastEval((c: any) => c.guilds.cache.size)))?.reduce((a: number, b: number) => a + b, 0) || 0) : this._client.guilds.cache.size,
        users: this._sharded ? ((await (this._client.shard?.broadcastEval((c: any) => c.guilds.cache.reduce((a: number, g: any) => a + (g.memberCount || 0), 0))))?.reduce((a: number, b: number) => a + b, 0) || 0) : this._client.guilds.cache.reduce((a: number, g: any) => a + (g.memberCount || 0), 0),
        interactions: [] as { name: string, number: number, type: InteractionType }[],
        locales: [] as { locale: Locale, number: number }[],
        guildsLocales: [] as { locale: Locale, number: number }[]
      }

      setInterval(async () => {
        let guildCount = this._sharded ?
          ((await this._client.shard?.broadcastEval((c: any) => c.guilds.cache.size))?.reduce((a: number, b: number) => a + b, 0) || 0) :
          this._client.guilds.cache.size;
        let userCount = this._sharded ?
          ((await this._client.shard?.broadcastEval((c: any) => c.guilds.cache.reduce((a: number, g: any) => a + (g.memberCount || 0), 0)))?.reduce((a: number, b: number) => a + b, 0) || 0) :
          this._client.guilds.cache.reduce((a: number, g: any) => a + (g.memberCount || 0), 0);
        if (data.guilds === guildCount && data.users === userCount && data.guildsLocales.length === 0 && data.locales.length === 0 && data.interactions.length === 0) return;
        axios.post(`${ApiEndpoints.BASE_URL}${ApiEndpoints.EDIT_STATS_URL.replace(':id', this._client.user!.id)}`, JSON.stringify(data), {headers: this._headers}).then((res) => {
          if (res.status === 401) throw new Error(ErrorCodes.INVALID_API_TOKEN);
          if (res.status === 423) throw new Error(ErrorCodes.SUSPENDED_BOT);
          if (res.status !== 200) throw new Error(ErrorCodes.INVALID_RESPONSE);
          if (res.status === 200) {
            data = {
              date: new Date().toISOString().slice(0, 10),
              guilds: guildCount,
              users: userCount,
              interactions: [] as { name: string, number: number, type: InteractionType }[],
              locales: [] as { locale: Locale, number: number }[],
              guildsLocales: [] as { locale: Locale, number: number }[]
            }
          }
        }).catch(e => {
          console.log("[DISCORDANALYTICS] " + ErrorCodes.DATA_NOT_SENT);
          console.error(e)
        });
      }, 60000 * 5);

      if (this._eventsToTrack.trackInteractions) {
        this._client.on('interactionCreate', (interaction: any) => {
          let guilds: { locale: Locale, number: number }[] = []
          this._client.guilds.cache.map((current: any) => guilds.find((x) => x.locale === current.preferredLocale) ?
            ++guilds.find((x) => x.locale === current.preferredLocale)!.number :
            guilds.push({ locale: current.preferredLocale, number: 1 }));

          if (this._eventsToTrack.trackGuildsLocale) data.guildsLocales = guilds

          if (this._eventsToTrack.trackUserLanguage) data.locales.find((x) => x.locale === interaction.locale) ?
            ++data.locales.find((x) => x.locale === interaction.locale)!.number :
            data.locales.push({ locale: interaction.locale, number: 1 });

          if (this._eventsToTrack.trackInteractions) {
            if (interaction.type === InteractionType.ApplicationCommand || interaction.type === InteractionType.ApplicationCommandAutocomplete)
              data.interactions.find((x) => x.name === interaction.commandName && x.type === interaction.type) ?
                ++data.interactions.find((x) => x.name === interaction.commandName && x.type === interaction.type)!.number :
                data.interactions.push({ name: interaction.commandName, number: 1, type: interaction.type });

            else if (interaction.type === InteractionType.MessageComponent || interaction.type === InteractionType.ModalSubmit)
              data.interactions.find((x) => x.name === interaction.customId && x.type === interaction.type) ?
                ++data.interactions.find((x) => x.name === interaction.customId && x.type === interaction.type)!.number :
                data.interactions.push({ name: interaction.customId, number: 1, type: interaction.type });
          }
        });
      }
    }).catch(_e => {
      console.log("[DISCORDANALYTICS] " + ErrorCodes.DATA_NOT_SENT);
      console.error(_e);
      return setTimeout(() => this.trackEvents(), 60000);
    });
  }
}