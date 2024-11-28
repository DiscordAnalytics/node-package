import {
  ApiEndpoints,
  DiscordAnalyticsOptions,
  ErrorCodes,
  InteractionData,
  InteractionType,
  Locale,
  TrackGuildType
} from "../utils/types";
import npmPackageData from "../../package.json";
import fetch from "node-fetch";

/**
 * @class DiscordAnalytics
 * @description The Oceanic.js class for the DiscordAnalytics library.
 * @param {DiscordAnalyticsOptions} options - Configuration options.
 * @property {any} options.client - The Oceanic.js client to track events for.
 * @property {string} options.apiToken - The API token for DiscordAnalytics.
 * @property {boolean} options.sharded - /!\ Not compatible with Oceanic.js
 * @property {boolean} options.debug - Enable or not the debug mode /!\ MUST BE USED ONLY FOR DEVELOPMENT PURPOSES /!\
 * @example
 * const { default: DiscordAnalytics } = require('discord-analytics/oceanic');
 * const { Client } = require('oceanic.js');
 * const client = new Client({
 *   auth: "Bot <YOUR_BOT_TOKEN>",
 *   gateway: {
 *     intents: ["GUILDS"]
 *   }
 * })
 * client.on('ready', () => {
 *   const analytics = new DiscordAnalytics({
 *     client: client,
 *     apiToken: 'YOUR_API_TOKEN'
 *   });
 *   analytics.trackEvents();
 * });
 * client.connect();
 *
 * // Check docs for more informations about advanced usages : https://docs.discordanalytics.xyz/get-started/installation/oceanic.js
 */
export default class DiscordAnalytics {
  private readonly _client: any;
  private readonly _apiToken: string;
  private readonly _sharded: boolean = false;
  private readonly _debug: boolean = false
  private readonly _headers: { 'Content-Type': string; Authorization: string; };
  private _isReady: boolean

  constructor(options: Omit<DiscordAnalyticsOptions, "sharded">) {
    this._client = options.client;
    this._apiToken = options.apiToken;
    this._headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bot ${this._apiToken}`
    }
    this._isReady = false
    this._debug = options.debug || false
  }

  /**
   * Initialize DiscordAnalytics on your bot
   * /!\ Advanced users only
   * /!\ Required to use DiscordAnalytics (except if you use the trackEvents function)
   * /!\ Must be used when the client is ready (recommended to use in ready event to prevent problems)
   */
  public async init() {
    const app = await this._client.rest.applications.getCurrent();

    fetch(`${ApiEndpoints.BASE_URL}${ApiEndpoints.EDIT_SETTINGS_URL.replace(':id', this._client.user.id)}`, {
      headers: this._headers,
      body: JSON.stringify({
        username: this._client.user.username,
        avatar: this._client.user.avatar,
        framework: "oceanic",
        version: npmPackageData.version,
        team: app.team
          ? app.team.members.map((member: any) => member.user.id)
          : app.owner
            ? [app.owner.id]
            : [],
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

        let guildCount = this._client.guilds.toArray().length;

        let userCount = this._client.guilds.reduce((a: number, g: any) => a + (g.memberCount || 0), 0);

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
              interactions: [],
              locales: [],
              guildsLocales: [],
              guildMembers: await this.calculateGuildMembersRepartition(),
              guildsStats: [],
              addedGuilds: 0,
              removedGuilds: 0,
              users_type: {
                admin: 0,
                moderator: 0,
                new_member: 0,
                other: 0,
                private_message: 0
              }
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
    interactions: [] as InteractionData[],
    locales: [] as { locale: Locale, number: number }[],
    guildsLocales: [] as { locale: Locale, number: number }[],
    guildMembers: {
      little: 0,
      medium: 0,
      big: 0,
      huge: 0
    },
    guildsStats: [] as { guildId: string, name: string, icon: string, members: number, interactions: number }[],
    addedGuilds: 0,
    removedGuilds: 0,
    users_type: {
      admin: 0,
      moderator: 0,
      new_member: 0,
      other: 0,
      private_message: 0
    }
  }

  private async calculateGuildMembersRepartition(): Promise<{ little: number, medium: number, big: number, huge: number }> {
    const res = {
      little: 0,
      medium: 0,
      big: 0,
      huge: 0
    }

    let guildsMembers: number[] = this._client.guilds.map((guild: any) => guild.memberCount)

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
  public async trackInteractions(interaction: any) {
    if (this._debug) console.log("[DISCORDANALYTICS] trackInteractions() triggered")
    if (!this._isReady) throw new Error(ErrorCodes.INSTANCE_NOT_INITIALIZED)

    let guilds: { locale: Locale, number: number }[] = []
    this._client.guilds.map((current: any) => guilds.find((x) => x.locale === current.preferredLocale) ?
      ++guilds.find((x) => x.locale === current.preferredLocale)!.number :
      guilds.push({ locale: current.preferredLocale, number: 1 }));

    this.statsData.guildsLocales = guilds

    this.statsData.locales.find((x) => x.locale === interaction.locale) ?
      ++this.statsData.locales.find((x) => x.locale === interaction.locale)!.number :
      this.statsData.locales.push({ locale: interaction.locale, number: 1 });

    if (interaction.type === InteractionType.ApplicationCommand) {
      const commandType = interaction.data.type;
      this.statsData.interactions.find((x) => x.name === interaction.data.name && x.type === interaction.type && x.command_type === commandType) ?
        ++this.statsData.interactions.find((x) => x.name === interaction.data.name && x.type === interaction.type && x.command_type === commandType)!.number :
        this.statsData.interactions.push({ name: interaction.data.name, number: 1, type: interaction.type, command_type: commandType });
    }

    else if (interaction.type === InteractionType.MessageComponent || interaction.type === InteractionType.ModalSubmit)
      this.statsData.interactions.find((x) => x.name === interaction.data.customID && x.type === interaction.type) ?
        ++this.statsData.interactions.find((x) => x.name === interaction.data.customID && x.type === interaction.type)!.number :
        this.statsData.interactions.push({ name: interaction.data.customID, number: 1, type: interaction.type });

    const guildData = this.statsData.guildsStats.find(guild => interaction.guildID ? guild.guildId === interaction.guildID : guild.guildId === "dm")
    if (guildData) this.statsData.guildsStats = this.statsData.guildsStats.filter(guild => guild.guildId === guildData.guildId)

    const guild = this._client.guilds.find((guild: any) => guild.id === interaction.guildID)
    this.statsData.guildsStats.push({
      guildId: interaction.guildID || "dm",
      name: guild ? guild.name : "DM",
      icon: guild && guild.icon ? guild.icon : undefined,
      interactions: guildData ? guildData.interactions + 1 : 1,
      members: guild ? guild.memberCount : 0
    })

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    if (!interaction.guild) ++this.statsData.users_type.private_message
    else if (interaction.member.permissions.has(8n) || interaction.member.permissions.has(32n)) ++this.statsData.users_type.admin
    else if (interaction.member.permissions.has(8192n) || interaction.member.permissions.has(2n) || interaction.member.permissions.has(4n) || interaction.member.permissions.has(4194304n) || interaction.member.permissions.has(8388608n) || interaction.member.permissions.has(16777216n) || interaction.member.permissions.has(1099511627776n)) ++this.statsData.users_type.moderator
    else if (interaction.member.joinedAt && interaction.member.joinedAt > oneWeekAgo) ++this.statsData.users_type.new_member
  }

  /**
   * Track guilds
   * /!\ Advanced users only
   * /!\ You need to initialize the class first
   * @param guild - The Guild instance only
   * @param {TrackGuildType} type - "create" if the event is guildCreate and "delete" if is guildDelete
   */
  public async trackGuilds(guild: any, type: TrackGuildType) {
    if (this._debug) console.log(`[DISCORDANALYTICS] trackGuilds(${type}) triggered`)
    if (type === "create") this.statsData.addedGuilds++
    else this.statsData.removedGuilds++
  }

  /**
   * Let DiscordAnalytics declare the events necessary for its operation.
   * /!\ Not recommended for big bots
   * /!\ Not compatible with other functions
   */
  public trackEvents() {
    if (!this._client.ready) this._client.on("ready", async () => await this.init())
    else this.init()
    this._client.on("interactionCreate", async (interaction: any) => await this.trackInteractions(interaction))
  }
}