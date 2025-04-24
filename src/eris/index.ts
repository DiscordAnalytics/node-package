import { ApiEndpoints, DiscordAnalyticsOptions, ErrorCodes, InteractionType } from "../utils/types";
import npmPackageData from "../../package.json";
import AnalyticsBase from "../base";

/**
 * @class DiscordAnalytics
 * @description The Eris class for the DiscordAnalytics library.
 * @param {DiscordAnalyticsOptions} options - Configuration options.
 * @property {any} options.client - The Eris client to track events for.
 * @property {string} options.apiToken - The API token for DiscordAnalytics.
 * @property {boolean} options.debug - Enable or not the debug mode /!\ MUST BE USED ONLY FOR DEVELOPMENT PURPOSES /!\
 * @example
 * const { default: DiscordAnalytics } = require('discord-analytics/eris');
 * const Eris = require('eris');
 * const client = new Client("YOUR_BOT_TOKEN", {
 *   intents: ["guilds"]
 * })
 * client.on('ready', () => {
 *   const analytics = new DiscordAnalytics({
 *     client: client,
 *     apiToken: 'YOUR_API_TOKEN'
 *   });
 *   analytics.init();
 *   analytics.trackEvents();
 * });
 * client.connect()
 *
 * @link https://discordanalytics.xyz/docs/main/get-started/installation/eris - Check docs for more informations about advanced usages
 */
export default class DiscordAnalytics extends AnalyticsBase {
  private readonly _client: any;
  private _isReady: boolean = false;

  constructor(options: Omit<DiscordAnalyticsOptions, "sharded">) {
    super(options.apiToken, options.debug);
    this._client = options.client;
  }

  /**
   * Initialize DiscordAnalytics on your bot
   * /!\ Advanced users only
   * /!\ Required to use DiscordAnalytics
   * /!\ Must be used when the client is ready (recommended to use in ready event to prevent problems)
   */
  public async init(): Promise<void> {
    const url = `${ApiEndpoints.BASE_URL}${ApiEndpoints.EDIT_SETTINGS_URL.replace(":id", this._client.user.id)}`;
    const body = JSON.stringify({
      username: this._client.user.username,
      avatar: this._client.user.avatar,
      framework: "eris",
      version: npmPackageData.version,
      team: this._client.application.owner
        ? this._client.application.owner.hasOwnProperty("members")
          ? this._client.application.owner.members.map((member: any) => member.user.id)
          : [this._client.application.owner.id]
        : [],
    });

    await this.api_call_with_retries("PATCH", url, body);

    if (this.debug) console.debug("[DISCORDANALYTICS] Instance successfully initialized");
    this._isReady = true;

    if (this.debug) {
      if (process.argv[2] === "--dev") console.debug("[DISCORDANALYTICS] DevMode is enabled. Stats will be sent every 30s.");
      else console.debug("[DISCORDANALYTICS] DevMode is disabled. Stats will be sent every 5min.");
    }

    setInterval(async () => {
      if (this.debug) console.debug("[DISCORDANALYTICS] Sending stats...");

      const guildCount = this._client.guilds.size;
      const userCount = this._client.guilds.reduce((a: number, g: any) => a + g.memberCount, 0);
      const guildMembers: number[] = this._client.guilds.map((guild: any) => guild.memberCount);

      await this.sendStats(this._client.user.id, guildCount, userCount, guildMembers);
    }, process.argv[2] === "--dev" ? 30000 : 5 * 60000);
  }

  /**
   * Track interactions
   * /!\ Advanced users only
   * /!\ You need to initialize the class first
   * @param interaction - BaseInteraction class and its extensions only
   * @param interactionNameResolver - A function that will resolve the name of the interaction
   */
  public async trackInteractions(interaction: any, interactionNameResolver?: (interaction: any) => string): Promise<void> {
    if (this.debug) console.log("[DISCORDANALYTICS] trackInteractions() triggered")
    if (!this._isReady) throw new Error(ErrorCodes.INSTANCE_NOT_INITIALIZED)

    this.updateOrInsert(
      this.stats_data.guildsLocales,
      (x) => x.locale === interaction.guild?.preferredLocale,
      (x) => x.number++,
      () => ({ locale: interaction.guild?.preferredLocale, number: 1 })
    );

    if (interaction.type === InteractionType.ApplicationCommand) {
      const name = interactionNameResolver ? interactionNameResolver(interaction) : interaction.data.name;
      this.updateOrInsert(
        this.stats_data.interactions,
        (x) => x.name === name && x.type === interaction.type,
        (x) => x.number++,
        () => ({ name, number: 1, type: interaction.type })
      );
    } else if (interaction.type === InteractionType.MessageComponent) {
      const name = interactionNameResolver ? interactionNameResolver(interaction) : interaction.data.custom_id;
      this.updateOrInsert(
        this.stats_data.interactions,
        (x) => x.name === name && x.type === interaction.type,
        (x) => x.number++,
        () => ({ name, number: 1, type: interaction.type })
      );
    }

    this.updateOrInsert(
      this.stats_data.guildsStats,
      (x) => x.guildId === (interaction.guildID || "dm"),
      (x) => x.interactions++,
      () => ({
        guildId: interaction.guildID || "dm",
        name: interaction.guildID ? this._client.guilds.get(interaction.guildID)?.name : "DM",
        icon: interaction.guildID ? this._client.guilds.get(interaction.guildID)?.icon : undefined,
        interactions: 1,
        members: interaction.guildID ? this._client.guilds.get(interaction.guildID)?.memberCount : 0,
      })
    );
  }

  /**
   * Let DiscordAnalytics declare the events necessary for its operation.
   * /!\ Not recommended for big bots
   * /!\ Not compatible with other functions
   * @param interactionNameResolver - A function that will resolve the name of the interaction
   */
  public trackEvents(interactionNameResolver?: (interaction: any) => string): void {
    if (this.debug) console.debug("[DISCORDANALYTICS] trackEvents() triggered");
    if (!this._isReady) throw new Error(ErrorCodes.INSTANCE_NOT_INITIALIZED);

    this._client.on("interactionCreate", async (interaction: any) => await this.trackInteractions(interaction, interactionNameResolver));
    this._client.on("guildCreate", (guild: any) => this.trackGuilds(guild, "create"));
    this._client.on("guildDelete", (guild: any) => this.trackGuilds(guild, "delete"));
  }
}