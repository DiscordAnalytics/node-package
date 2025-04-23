import {
  ApiEndpoints,
  ApplicationCommandType,
  DiscordAnalyticsOptions,
  ErrorCodes,
  InteractionType,
  LocaleData,
} from "../utils/types";
import npmPackageData from "../../package.json";
import AnalyticsBase from "../base";

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
 * @link https://discordanalytics.xyz/docs/main/get-started/installation/discord.js - Check docs for more informations about advanced usages
 */
export default class DiscordAnalytics extends AnalyticsBase {
  private readonly _client: any;
  private readonly _sharded: boolean = false;
  private readonly _debug: boolean = false;
  private _isReady: boolean = false;

  constructor(options: DiscordAnalyticsOptions) {
    super(options.apiToken, options.debug);
    this._client = options.client;
    this._sharded = options.sharded || false;
    this._debug = options.debug || false;
  }

  /**
   * Initialize DiscordAnalytics on your bot
   * /!\ Advanced users only
   * /!\ Required to use DiscordAnalytics (except if you use the trackEvents function)
   * /!\ Must be used when the client is ready (recommended to use in ready event to prevent problems)
   */
  public async init(): Promise<void> {
    const method = "PATCH";
    const url = `${ApiEndpoints.BASE_URL}${ApiEndpoints.EDIT_SETTINGS_URL.replace(":id", this._client.user.id)}`;
    const body = JSON.stringify({
      username: this._client.user.username,
      avatar: this._client.user.avatar,
      framework: "discord.js",
      version: npmPackageData.version,
      team: this._client.application.owner
        ? this._client.application.owner.hasOwnProperty("members")
          ? this._client.application.owner.members.map((member: any) => member.user.id)
          : [this._client.application.owner.id]
        : [],
    });

    await this.api_call_with_retries(method, url, body);

    if (this._debug) console.debug("[DISCORDANALYTICS] Instance successfully initialized");
    this._isReady = true;

    if (this._debug) {
      if (process.argv[2] === "--dev") console.debug("[DISCORDANALYTICS] DevMode is enabled. Stats will be sent every 30s.");
      else console.debug("[DISCORDANALYTICS] DevMode is disabled. Stats will be sent every 5min.");
    }

    setInterval(async () => {
      if (this._debug) console.debug("[DISCORDANALYTICS] Sending stats...");

      let guildCount = this._sharded
        ? ((await this._client.shard?.broadcastEval((c: any) => c.guilds.cache.size))?.reduce((a: number, b: number) => a + b, 0) || 0)
        : this._client.guilds.cache.size;

      let userCount = this._sharded
        ? ((await this._client.shard?.broadcastEval((c: any) => c.guilds.cache.reduce((a: number, g: any) => a + (g.memberCount || 0), 0)))?.reduce((a: number, b: number) => a + b, 0) || 0)
        : this._client.guilds.cache.reduce((a: number, g: any) => a + (g.memberCount || 0), 0);

      let guildMembers = await this.calculateGuildMembersRepartition();

      await this.sendStats(this._client.user.id, guildCount, userCount, guildMembers);
    }, process.argv[2] === "--dev" ? 30000 : 5 * 60000);
  }

  private async calculateGuildMembersRepartition(): Promise<{ little: number; medium: number; big: number; huge: number }> {
    const guildsMembers: number[] = !this._sharded 
      ? this._client.guilds.cache.map((guild: any) => guild.memberCount)
      : ((await this._client.shard?.broadcastEval(
          (c: any) => c.guilds.cache.map((guild: any) => guild.memberCount)
        ))?.flat() ?? []);

    return guildsMembers.reduce((acc, count) => {
      if (count <= 100) acc.little++;
      else if (count <= 500) acc.medium++;
      else if (count <= 1500) acc.big++;
      else acc.huge++;
      return acc;
    }, { little: 0, medium: 0, big: 0, huge: 0 });
  }

  public async trackInteractions(interaction: any, interactionNameResolver?: (interaction: any) => string): Promise<void> {
    if (this._debug) console.debug("[DISCORDANALYTICS] trackInteractions() triggered");
    if (!this._isReady) throw new Error(ErrorCodes.INSTANCE_NOT_INITIALIZED);

    let guildsLocales: LocaleData[] = [];
    this._client.guilds.cache.map(
      (current: any) => guildsLocales.find((x) => x.locale === current.preferredLocale)
        ? ++guildsLocales.find((x) => x.locale === current.preferredLocale)!.number
        : guildsLocales.push({ locale: current.preferredLocale, number: 1 })
    );

    this.stats_data.guildsLocales = guildsLocales;

    this.stats_data.locales.find((x) => x.locale === interaction.locale)
      ? ++this.stats_data.locales.find((x) => x.locale === interaction.locale)!.number
      : this.stats_data.locales.push({ locale: interaction.locale, number: 1 });

    if (interaction.type === InteractionType.ApplicationCommand) {
      const commandType = interaction.command
        ? interaction.command.type
        : ApplicationCommandType.ChatInputCommand;
      const commandName = interactionNameResolver
        ? interactionNameResolver(interaction)
        : interaction.commandName;
      this.stats_data.interactions.find(
        (x) => x.name === commandName && x.type === interaction.type && x.command_type === commandType
      )
        ? ++this.stats_data.interactions.find(
            (x) => x.name === commandName && x.type === interaction.type && x.command_type === commandType
          )!.number
        : this.stats_data.interactions.push({ name: commandName, number: 1, type: interaction.type as InteractionType, command_type: commandType });
    } else if (interaction.type === InteractionType.MessageComponent || interaction.type === InteractionType.ModalSubmit) {
      const interactionName = interactionNameResolver ? interactionNameResolver(interaction) : interaction.customId;

      this.stats_data.interactions.find((x) => x.name === interactionName && x.type === interaction.type)
        ? ++this.stats_data.interactions.find((x) => x.name === interactionName && x.type === interaction.type)!.number
        : this.stats_data.interactions.push({ name: interactionName, number: 1, type: interaction.type });
    }

    const guildData = this.stats_data.guildsStats.find(
      (guild) => interaction.guild ? guild.guildId === interaction.guild.id : guild.guildId === "dm"
    );
    if (guildData) this.stats_data.guildsStats = this.stats_data.guildsStats.filter((guild) => guild.guildId !== guildData.guildId);
    this.stats_data.guildsStats.push({
      guildId: interaction.guild ? interaction.guild.id : "dm",
      name: interaction.guild ? interaction.guild.name : "DM",
      icon: interaction.guild && interaction.guild.icon ? interaction.guild.icon : undefined,
      interactions: guildData ? guildData.interactions + 1 : 1,
      members: interaction.guild ? interaction.guild.memberCount : 0,
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    if (!interaction.inGuild()) ++this.stats_data.users_type.private_message;
    else if (
      interaction.member
      && interaction.member.permissions
      && interaction.member.permissions.has(8n)
      || interaction.member.permissions.has(32n)
    ) ++this.stats_data.users_type.admin;
    else if (
      interaction.member
      && interaction.member.permissions
      && interaction.member.permissions.has(8192n)
      || interaction.member.permissions.has(2n)
      || interaction.member.permissions.has(4n) 
      || interaction.member.permissions.has(4194304n)
      || interaction.member.permissions.has(8388608n)
      || interaction.member.permissions.has(16777216n)
      || interaction.member.permissions.has(1099511627776n)
    ) ++this.stats_data.users_type.moderator;
    else if (
      interaction.member
      && interaction.member.joinedAt
      && interaction.member.joinedAt > oneWeekAgo
    ) ++this.stats_data.users_type.new_member;
  }

  /**
   * Let DiscordAnalytics declare the events necessary for its operation.
   * /!\ Not recommended for big bots
   * /!\ Not compatible with other functions
   * @param interactionNameResolver - A function that will resolve the name of the interaction
   */
  public trackEvents(interactionNameResolver?: (interaction: any) => string): void {
    if (this._debug) console.debug("[DISCORDANALYTICS] trackEvents() triggered");
    if (!this._isReady) throw new Error(ErrorCodes.INSTANCE_NOT_INITIALIZED);

    this._client.on("interactionCreate", async (interaction: any) => await this.trackInteractions(interaction, interactionNameResolver));
    this._client.on("guildCreate", (guild: any) => this.trackGuilds(guild, "create"));
    this._client.on("guildDelete", (guild: any) => this.trackGuilds(guild, "delete"));
  }
}
