import { ApiEndpoints, ApplicationCommandType, DiscordAnalyticsOptions, ErrorCodes, InteractionType } from "../utils/types";
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
 * @link https://discordanalytics.xyz/docs/main/get-started/installation/discord.js - Check docs for more informations about advanced usages
 */
export default class DiscordAnalytics extends AnalyticsBase {
  private readonly _client: any;
  private readonly _sharded: boolean = false;
  private _isReady: boolean = false;

  constructor(options: DiscordAnalyticsOptions) {
    super(options.apiToken, options.debug);
    this._client = options.client;
    this._sharded = options.sharded || false;
  }

  /**
   * Initialize DiscordAnalytics on your bot
   * /!\ Advanced users only
   * /!\ Required to use DiscordAnalytics (except if you use the trackEvents function)
   * /!\ Must be used when the client is ready (recommended to use in ready event to prevent problems)
   */
  public async init(): Promise<void> {
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

    await this.api_call_with_retries("PATCH", url, body);

    if (this.debug) console.debug("[DISCORDANALYTICS] Instance successfully initialized");
    this._isReady = true;

    if (this.debug) {
      if (process.argv[2] === "--dev") console.debug("[DISCORDANALYTICS] DevMode is enabled. Stats will be sent every 30s.");
      else console.debug("[DISCORDANALYTICS] DevMode is disabled. Stats will be sent every 5min.");
    }

    setInterval(async () => {
      if (this.debug) console.debug("[DISCORDANALYTICS] Sending stats...");

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

  /**
   * Track interactions
   * /!\ Advanced users only
   * /!\ You need to initialize the class first
   * @param interaction - BaseInteraction class and its extensions only
   * @param interactionNameResolver - A function that will resolve the name of the interaction
   */
  public async trackInteractions(interaction: any, interactionNameResolver?: (interaction: any) => string): Promise<void> {
    if (this.debug) console.debug("[DISCORDANALYTICS] trackInteractions() triggered");
    if (!this._isReady) throw new Error(ErrorCodes.INSTANCE_NOT_INITIALIZED);

    const guildsLocales = this._client.guilds.cache.reduce((map: Map<string, number>, guild: any) => {
      const locale = guild.preferredLocale;
      map.set(locale, (map.get(locale) ?? 0) + 1);
      return map;
    }, new Map<string, number>());
    this.stats_data.guildsLocales = Array.from(guildsLocales, ([locale, number]) => ({ locale, number }));

    this.updateOrInsert(
      this.stats_data.locales,
      (x) => x.locale === interaction.locale,
      (x) => x.number++,
      () => ({ locale: interaction.locale, number: 1 })
    );

    if (interaction.type === InteractionType.ApplicationCommand) {
      const commandType = interaction.command
        ? interaction.command.type
        : ApplicationCommandType.ChatInputCommand;
      const commandName = interactionNameResolver
        ? interactionNameResolver(interaction)
        : interaction.commandName;
      this.updateOrInsert(
        this.stats_data.interactions,
        (x) => x.name === commandName
          && x.type === interaction.type
          && x.command_type === commandType,
        (x) => x.number++,
        () => ({
          name: commandName,
          number: 1,
          type: interaction.type,
          command_type: commandType,
        }),
      );
    } else if (interaction.type === InteractionType.MessageComponent || interaction.type === InteractionType.ModalSubmit) {
      const interactionName = interactionNameResolver
        ? interactionNameResolver(interaction)
        : interaction.customId;
      this.updateOrInsert(
        this.stats_data.interactions,
        (x) => x.name === interactionName && x.type === interaction.type,
        (x) => x.number++,
        () => ({
          name: interactionName,
          number: 1,
          type: interaction.type,
        }),
      );
    }

    this.updateOrInsert(
      this.stats_data.guildsStats,
      (x) => x.guildId === (interaction.guild ? interaction.guild.id : "dm"),
      (x) => x.interactions++,
      () => ({
        guildId: interaction.guild ? interaction.guild.id : "dm",
        name: interaction.guild ? interaction.guild.name : "DM",
        icon: interaction.guild && interaction.guild.icon ? interaction.guild.icon : undefined,
        interactions: 1,
        members: interaction.guild ? interaction.guild.memberCount : 0,
      }),
    );

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
    if (this.debug) console.debug("[DISCORDANALYTICS] trackEvents() triggered");
    if (!this._isReady) throw new Error(ErrorCodes.INSTANCE_NOT_INITIALIZED);

    this._client.on("interactionCreate", async (interaction: any) => await this.trackInteractions(interaction, interactionNameResolver));
    this._client.on("guildCreate", (guild: any) => this.trackGuilds(guild, "create"));
    this._client.on("guildDelete", (guild: any) => this.trackGuilds(guild, "delete"));
  }
}
