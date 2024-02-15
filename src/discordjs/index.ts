import {ApiEndpoints, DiscordAnalyticsOptions, ErrorCodes, InteractionType, Locale} from "../utils/types";
import npmPackageData from "../../package.json"

/**
 * @class DiscordAnalytics
 * @description The Discord.js class for the DiscordAnalytics library.
 * @param {DiscordAnalyticsOptions} options - Configuration options.
 * @property {any} options.client - The Discord.js client to track events for.
 * @property {string} options.apiToken - The API token for DiscordAnalytics.
 * @property {boolean} options.sharded - Whether the Discord.js client is sharded.
 * @property {boolean} options.debug - Enable or not the debug mode /!\ MUST BE USED ONLY FOR DEVELOPMENT PURPOSES /!\
 * @example
 * const { default: DiscordAnalytics } = require('discord-analytics/discordjs');
 * const { Client, IntentsBitField } = require('discord.js');
 * const client = new Client({
 *   intents: [IntentsBitField.Flags.Guilds]
 * })
 * client.on('ready', () => {
 *   const analytics = new DiscordAnalytics({
 *     client: client,
 *     apiToken: 'YOUR_API_TOKEN'
 *   });
 *   analytics.trackEvents();
 * });
 * client.login('YOUR_BOT_TOKEN');
 *
 * // Check docs for more informations about advanced usages : https://docs.discordanalytics.xyz/get-started/installation/discord.js
 */
export default class DiscordAnalytics {
  private readonly _client: any;
  private readonly _apiToken: string;
  private readonly _sharded: boolean = false;
  private readonly _debug: boolean = false
  private readonly _headers: { 'Content-Type': string; Authorization: string; };
  private _isReady: boolean

  constructor(options: DiscordAnalyticsOptions) {
    this._client = options.client;
    this._apiToken = options.apiToken;
    this._headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bot ${this._apiToken}`
    }
    this._sharded = options.sharded || false;
    this._isReady = false
    this._debug = options.debug || false
  }

  /**
   * Initialize DiscordAnalytics on your bot
   * /!\ Advanced users only
   * /!\ Required to use DiscordAnalytics (except if you use the trackEvents function)
   * /!\ Must be used when the client is ready (recommended to use in ready event to prevent problems)
   */
  public async init () {
    fetch(`${ApiEndpoints.BASE_URL}${ApiEndpoints.EDIT_SETTINGS_URL.replace(':id', this._client.user.id)}`, {
      headers: this._headers,
      body: JSON.stringify({
        username: this._client.user.username,
        avatar: this._client.user.avatar,
        framework: "discord.js",
        version: npmPackageData.version,
      }),
      method: "PATCH"
    }).then(async (res) => {
      if (res.status === 401) throw new Error(ErrorCodes.INVALID_API_TOKEN);
      if (res.status === 423) throw new Error(ErrorCodes.SUSPENDED_BOT);
      if (res.status !== 200) throw new Error(ErrorCodes.INVALID_RESPONSE);

      if (this._debug) console.debug("[DISCORDANALYTICS] Instance successfully initialized")
      this._isReady = true

      if (this._debug) {
        if (process.argv[2] === "--dev") console.debug("[DISCORDANALYTICS] DevMode is enabled. Stats will be sent every 30s.")
        else console.debug("[DISCORDANALYTICS] DevMode is disabled. Stats will be sent every 5min.")
      }

      setInterval(async () => {
        if (this._debug) console.debug("[DISCORDANALYTICS] Sending stats...")

        let guildCount = this._sharded ?
          ((await this._client.shard?.broadcastEval((c: any) => c.guilds.cache.size))?.reduce((a: number, b: number) => a + b, 0) || 0) :
          this._client.guilds.cache.size;

        let userCount = this._sharded ?
          ((await this._client.shard?.broadcastEval((c: any) => c.guilds.cache.reduce((a: number, g: any) => a + (g.memberCount || 0), 0)))?.reduce((a: number, b: number) => a + b, 0) || 0) :
          this._client.guilds.cache.reduce((a: number, g: any) => a + (g.memberCount || 0), 0);

        fetch(`${ApiEndpoints.BASE_URL}${ApiEndpoints.EDIT_STATS_URL.replace(':id', this._client.user!.id)}`, {
          headers: this._headers,
          body: JSON.stringify(this.statsData),
          method: "POST"
        }).then(async (res) => {
          if (res.status === 401) throw new Error(ErrorCodes.INVALID_API_TOKEN);
          if (res.status === 423) throw new Error(ErrorCodes.SUSPENDED_BOT);
          if (res.status !== 200) throw new Error(ErrorCodes.INVALID_RESPONSE);
          if (res.status === 200) {
            if (this._debug) console.debug(`[DISCORDANALYTICS] Stats ${JSON.stringify(this.statsData)} sent to the API`)

            this.statsData = {
              date: new Date().toISOString().slice(0, 10),
              guilds: guildCount,
              users: userCount,
              interactions: [] as { name: string, number: number, type: InteractionType }[],
              locales: [] as { locale: Locale, number: number }[],
              guildsLocales: [] as { locale: Locale, number: number }[],
              guildMembers: await this.calculateGuildMembersRepartition()
            }
          }
        }).catch(e => {
          if (this._debug) {
            console.debug("[DISCORDANALYTICS] " + ErrorCodes.DATA_NOT_SENT);
            console.error(e)
          }
        });
      }, process.argv[2] === "--dev" ? 30000 : 5 * 60000);
    })
  }

  private statsData = {
    date: new Date().toISOString().slice(0, 10),
    guilds: 0,
    users: 0,
    interactions: [] as { name: string, number: number, type: InteractionType }[],
    locales: [] as { locale: Locale, number: number }[],
    guildsLocales: [] as { locale: Locale, number: number }[],
    guildMembers: {
      little: 0,
      medium: 0,
      big: 0,
      huge: 0
    }
  }

  private async calculateGuildMembersRepartition (): Promise<{ little: number, medium: number, big: number, huge: number }> {
    const res = {
      little: 0,
      medium: 0,
      big: 0,
      huge: 0
    }

    let guildsMembers: number[] = []

    if (!this._sharded) guildsMembers = this._client.guilds.cache.map((guild: any) => guild.memberCount)
    else guildsMembers = [].concat(await this._client.shard?.broadcastEval((c: any) => c.guilds.cache.map((guild: any) => guild.memberCount)))

    for (const guild of guildsMembers) {
      if (guild <= 100) res.little++
      else if (guild > 100 && guild <= 500) res.medium++
      else if (guild > 500 && guild <= 1500) res.big++
      else if (guild > 1500) res.huge++
    }

    return res
  }

  /**
   * Track interactions
   * /!\ Advanced users only
   * /!\ You need to initialize the class first
   * @param interaction - BaseInteraction class and its extensions only
   */
  public async trackInteractions (interaction: any) {
    console.log("[DISCORDANALYTICS] tackInteractions() triggered")
    if (!this._isReady) throw new Error(ErrorCodes.INSTANCE_NOT_INITIALIZED)

    let guilds: { locale: Locale, number: number }[] = []
    this._client.guilds.cache.map((current: any) => guilds.find((x) => x.locale === current.preferredLocale) ?
      ++guilds.find((x) => x.locale === current.preferredLocale)!.number :
      guilds.push({ locale: current.preferredLocale, number: 1 }));

    this.statsData.guildsLocales = guilds

    this.statsData.locales.find((x) => x.locale === interaction.locale) ?
      ++this.statsData.locales.find((x) => x.locale === interaction.locale)!.number :
      this.statsData.locales.push({ locale: interaction.locale, number: 1 });

    if (interaction.type === InteractionType.ApplicationCommand || interaction.type === InteractionType.ApplicationCommandAutocomplete)
      this.statsData.interactions.find((x) => x.name === interaction.commandName && x.type === interaction.type) ?
        ++this.statsData.interactions.find((x) => x.name === interaction.commandName && x.type === interaction.type)!.number :
        this.statsData.interactions.push({ name: interaction.commandName, number: 1, type: interaction.type });

    else if (interaction.type === InteractionType.MessageComponent || interaction.type === InteractionType.ModalSubmit)
      this.statsData.interactions.find((x) => x.name === interaction.customId && x.type === interaction.type) ?
        ++this.statsData.interactions.find((x) => x.name === interaction.customId && x.type === interaction.type)!.number :
        this.statsData.interactions.push({ name: interaction.customId, number: 1, type: interaction.type });
  }

  /**
   * Let DiscordAnalytics declare the events necessary for its operation.
   * /!\ Not recommended for big bots
   * /!\ Not compatible with other functions
   */
  public trackEvents () {
    if (!this._client.isReady()) this._client.on("ready", async () => await this.init())
    else this.init()
    this._client.on("interactionCreate", async (interaction: any) => await this.trackInteractions(interaction))
  }
}