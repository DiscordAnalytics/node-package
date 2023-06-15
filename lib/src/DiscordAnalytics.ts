import { Client as DJSClient, InteractionType, Locale } from 'discord.js';
import { CommandInteraction, ComponentInteraction, Client as ErisClient } from 'eris';
import { EventsToTrack, LibType, ErrorCodes, ApiEndpoints } from '../utils/types';
import axios from 'axios';



/**
 * @class DiscordAnalytics
 * @description The main class for the DiscordAnalytics library.
 * @param {DJSClient | ErisClient} client The Discord client to track.
 * @param {LibType} type The type of client to track.
 * @param {EventsToTrack} eventsToTrack The events to track.
 * @example
 * const { LibType, default: DiscordAnalytics } = require('discord-analytics');
 * const { Client } = require('discord.js');
 * const client = new Client();
 * client.on('ready', () => {
 *  const analytics = new DiscordAnalytics(client, LibType.DJS, {
 *     trackInteractions: true,
 *     trackGuilds: true,
 *     trackUserCount: true,
 *     trackUserLanguage: true,
 *     trackGuildsLocale: true,
 *   }, "YOUR_API_TOKEN");
 *   analytics.trackEvents();
 * });
 * client.login('token');
 */
export default class DiscordAnalytics {
  private readonly _client: DJSClient | ErisClient;
  private _eventsToTrack: EventsToTrack;
  private _apiToken: string;
  private _libType: LibType;
  private _disableErisWarnings: boolean;
  private _headers: { 'Content-Type': string; Authorization: string; };

  constructor(client: DJSClient | ErisClient, type: LibType, eventsToTrack: EventsToTrack, apiToken: string, disableErisWarnings?: boolean) {
    if (type === LibType.DJS && client instanceof DJSClient) this._client = client;
    else if (type === LibType.ERIS && client instanceof ErisClient) this._client = client;
    else throw new Error(ErrorCodes.INVALID_CLIENT_TYPE);

    this._eventsToTrack = eventsToTrack;
    this._apiToken = apiToken;
    this._libType = type;
    this._disableErisWarnings = disableErisWarnings || false;
    this._headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bot ${this._apiToken}`
    }
  }

  /**
   * @description The client to track.
   * @type {DJSClient | ErisClient}
   * @readonly
   */
  public get client(): DJSClient | ErisClient {
    return this._client;
  }

  /**
   * @description Track the events specified in the constructor options.
   * @returns {void}
   */
  public trackEvents(): void {
    let events = this._eventsToTrack;
    if (!events.trackInteractions && !events.trackGuilds && !events.trackUserCount && !events.trackUserLanguage && !events.trackGuildsLocale) throw new Error(ErrorCodes.INVALID_EVENTS_COUNT);

    if (this._client instanceof ErisClient && !this._disableErisWarnings) console.warn("[DISCORDANALYTICS] You are using Eris, please note that some events are not supported by Eris. Please check the documentation for more information.")

    axios.patch(`${ApiEndpoints.BASE_URL}${ApiEndpoints.EDIT_SETTINGS_URL.replace(':id', this._client.user!.id)}`, {
      username: this._client.user!.username,
      avatar: this._client.user!.avatar,
      framework: this._libType,
      settings: this._eventsToTrack
    }, {
      headers: this._headers
    }).then(r => {
      if (r.status === 401) throw new Error(ErrorCodes.INVALID_API_TOKEN);
      if (r.status !== 200) throw new Error(ErrorCodes.INVALID_RESPONSE);
    }).catch(e => {
      console.log("[DISCORDANALYTICS] " + ErrorCodes.DATA_NOT_SENT);
      new Error(e)

      return setTimeout(() => this.trackEvents(), 60000);
    });

    if (this._client instanceof DJSClient) {
      if (!this._client.isReady()) throw new Error(ErrorCodes.CLIENT_NOT_READY);
      else this.trackDJSEvents();
    }
    else if (this._client instanceof ErisClient) {
      if (!this._client.ready) throw new Error(ErrorCodes.CLIENT_NOT_READY);
      else this.trackErisEvents();
    }
    else throw new Error(ErrorCodes.INVALID_CLIENT_TYPE);
  }

  private trackDJSEvents(): void {
    if (this._client instanceof DJSClient) {
      const client = this._client as DJSClient;

      let data = {
        date: new Date().toISOString().slice(0, 10),
        guilds: client.guilds.cache.size,
        users: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
        interactions: [] as { name: string, number: number, type: InteractionType }[],
        locales: [] as { locale: Locale, number: number }[],
        guildsLocales: [] as { locale: Locale, number: number }[]
      }

      setInterval(() => {
        let guildCount = client.guilds.cache.size;
        let userCount = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
        if (data.guilds === guildCount && data.users === userCount && data.guildsLocales.length === 0 && data.locales.length === 0 && data.interactions.length === 0) return;
        axios.post(`${ApiEndpoints.BASE_URL}${ApiEndpoints.EDIT_STATS_URL.replace(':id', client.user!.id)}`, JSON.stringify(data), {headers: this._headers}).then((res) => {
          if (res.status === 401) throw new Error(ErrorCodes.INVALID_API_TOKEN);
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
          new Error(e)
        });
      }, 60000);

      if (this._eventsToTrack.trackInteractions) {
        client.on('interactionCreate', (interaction) => {
          let guilds: { locale: Locale, number: number }[] = []
          client.guilds.cache.map((current) => guilds.find((x) => x.locale === current.preferredLocale) ?
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
    }
  }

  private trackErisEvents(): void {
    if (this._client instanceof ErisClient) {
      const client = this._client as ErisClient;

      let data = {
        date: new Date().toISOString().slice(0, 10),
        guilds: client.guilds.size,
        users: client.guilds.reduce((a, g) => a + g.memberCount, 0),
        interactions: [] as { name: string, number: number, type: InteractionType }[],
        locales: [] as { locale: Locale, number: number }[],
        guildsLocales: [] as { locale: string, number: number }[]
      }

      setInterval(() => {
        let guildCount = client.guilds.size;
        let userCount = client.guilds.reduce((a, g) => a + g.memberCount, 0);
        if (data.guilds === guildCount && data.users === userCount && data.guildsLocales.length === 0 && data.locales.length === 0 && data.interactions.length === 0) return;
        axios.post(`${ApiEndpoints.BASE_URL}${ApiEndpoints.EDIT_STATS_URL.replace(':id', client.user!.id)}`, JSON.stringify(data), {headers: this._headers}).then((res) => {
          if (res.status === 401) throw new Error(ErrorCodes.INVALID_API_TOKEN);
          if (res.status !== 200) throw new Error(ErrorCodes.INVALID_RESPONSE);
          if (res.status === 200) {
            data = {
              date: new Date().toISOString().slice(0, 10),
              guilds: guildCount,
              users: userCount,
              interactions: [] as { name: string, number: number, type: InteractionType }[],
              locales: [] as { locale: Locale, number: number }[],
              guildsLocales: [] as { locale: string, number: number }[]
            }
          }
        }).catch(e => {
          console.log("[DISCORDANALYTICS] " + ErrorCodes.DATA_NOT_SENT);
          new Error(e)
        });
      }, 60000);

      if (this._eventsToTrack.trackInteractions) {
        client.on('interactionCreate', (interaction) => {
          let guilds: { locale: string, number: number }[] = []
          client.guilds.map((current) => guilds.find((x) => x.locale === current.preferredLocale) ?
            ++guilds.find((x) => x.locale === current.preferredLocale)!.number :
            guilds.push({ locale: current.preferredLocale, number: 1 }));

          if (this._eventsToTrack.trackGuildsLocale) data.guildsLocales = guilds;

          if (this._eventsToTrack.trackInteractions) {
            if (interaction instanceof CommandInteraction) data.interactions.find((x) => x.name === interaction.data.name && x.type === interaction.type) ?
              ++data.interactions.find((x) => x.name === interaction.data.name && x.type === interaction.type)!.number :
              data.interactions.push({name: interaction.data.name, number: 1, type: interaction.type});
            else if (interaction instanceof ComponentInteraction) data.interactions.find((x) => x.name === interaction.data.custom_id && x.type === interaction.type) ?
              ++data.interactions.find((x) => x.name === interaction.data.custom_id && x.type === interaction.type)!.number :
              data.interactions.push({ name: interaction.data.custom_id, number: 1, type: interaction.type });
          }
        });
      }
    }
  }
}