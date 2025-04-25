import { AnalyticsBase, ApiEndpoints, DiscordAnalyticsOptions, ErrorCodes, InteractionType } from '@discordanalytics/core';
import npmPackageData from '../package.json';

/**
 * @class DiscordAnalytics
 * @description The Oceanic.js class for the DiscordAnalytics library.
 * @param {DiscordAnalyticsOptions} options - Configuration options.
 * @property {any} options.client The Oceanic.js client to track events for.
 * @property {string} options.apiToken The API token for DiscordAnalytics.
 * @property {boolean} options.debug Enable or not the debug mode /!\ MUST BE USED ONLY FOR DEVELOPMENT PURPOSES /!\
 * @example
 * const { default: DiscordAnalytics } = require('discord-analytics/oceanic');
 * const { Client } = require('oceanic.js');
 * const client = new Client({
 *   auth: 'Bot <YOUR_BOT_TOKEN>',
 *   gateway: {
 *     intents: ['GUILDS']
 *   }
 * })
 * client.on('ready', () => {
 *   const analytics = new DiscordAnalytics({
 *     client: client,
 *     apiToken: 'YOUR_API_TOKEN'
 *   });
 *   analytics.init();
 *   analytics.trackEvents();
 * });
 * client.connect();
 * @link https://discordanalytics.xyz/docs/main/get-started/installation/oceanic.js Check docs for more informations about advanced usages
 */
export default class DiscordAnalytics extends AnalyticsBase {
  private readonly _client: any;
  private _isReady: boolean = false;

  constructor(options: Omit<DiscordAnalyticsOptions, 'sharded'>) {
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
    const app = await this._client.rest.applications.getCurrent();
    const url = ApiEndpoints.EDIT_SETTINGS_URL.replace(':id', this._client.user.id);
    const body = JSON.stringify({
      username: this._client.user.username,
      avatar: this._client.user.avatar,
      framework: 'oceanic',
      version: npmPackageData.version,
      team: app.team
        ? app.team.members.map((member: any) => member.user.id)
        : app.owner
          ? [app.owner.id]
          : [],
    });

    await this.api_call_with_retries('PATCH', url, body);

    this.debug('[DISCORDANALYTICS] Instance successfully initialized');
    this.client_id = this._client.user.id;
    this._isReady = true;

    const dev_mode = process.argv[2] === '--dev';
    this.debug(`[DISCORDANALYTICS] DevMode is ${dev_mode ? 'enabled' : 'disabled'}. Stats will be sent every ${dev_mode ? '30s' : '5min'}.`);

    setInterval(async () => {
      this.debug('[DISCORDANALYTICS] Sending stats...');

      const guildCount = this._client.guilds.toArray().length;
      const userCount = this._client.guilds.reduce((a: number, g: any) => a + (g.memberCount || 0), 0);
      const guildMembers: number[] = this._client.guilds.map((guild: any) => guild.memberCount);

      await this.sendStats(this._client.user.id, guildCount, userCount, guildMembers);
    }, dev_mode ? 30000 : 300000);
  }

  /**
   * Track interactions
   * /!\ Advanced users only
   * /!\ You need to initialize the class first
   * @param interaction BaseInteraction class and its extensions only
   * @param interactionNameResolver A function that will resolve the name of the interaction
   */
  public async trackInteractions(interaction: any, interactionNameResolver?: (interaction: any) => string): Promise<void> {
    this.debug('[DISCORDANALYTICS] trackInteractions() triggered');
    if (!this._isReady) throw new Error(ErrorCodes.INSTANCE_NOT_INITIALIZED);

    this.updateOrInsert(
      this.stats_data.guildsLocales,
      (x) => x.locale === interaction.guild?.preferredLocale,
      (x) => x.number++,
      () => ({ locale: interaction.guild?.preferredLocale, number: 1 }),
    );

    this.updateOrInsert(
      this.stats_data.locales,
      (x) => x.locale === interaction.locale,
      (x) => x.number++,
      () => ({ locale: interaction.locale, number: 1 }),
    );

    if (interaction.type === InteractionType.ApplicationCommand) {
      const commandType = interaction.data.type;
      const commandName = interactionNameResolver
        ? interactionNameResolver(interaction)
        : interaction.data.name;
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
        : interaction.data.customID;
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
      (x) => x.guildId === (interaction.guild ? interaction.guildID : 'dm'),
      (x) => x.interactions++,
      () => ({
        guildId: interaction.guild ? interaction.guildID : 'dm',
        name: interaction.guild ? interaction.guild.name : 'DM',
        icon: interaction.guild && interaction.guild.icon ? interaction.guild.icon : undefined,
        interactions: 1,
        members: interaction.guild ? interaction.guild.memberCount : 0,
      }),
    );

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    if (!interaction.guild) ++this.stats_data.users_type.private_message
    else if (
      interaction.member
      && interaction.member.permissions 
      && interaction.member.permissions.has(8n)
      || interaction.member.permissions.has(32n)
    ) ++this.stats_data.users_type.admin
    else if (
      interaction.member
      && interaction.member.permissions
      && interaction.member.permissions.has(8192n)
      || interaction.member.permissions.has(2n)
      || interaction.member.permissions.has(4194304n)
      || interaction.member.permissions.has(8388608n)
      || interaction.member.permissions.has(16777216n)
      || interaction.member.permissions.has(1099511627776n)
    ) ++this.stats_data.users_type.moderator
    else if (
      interaction.member
      && interaction.member.joinedAt
      && interaction.member.joinedAt > oneWeekAgo
    ) ++this.stats_data.users_type.new_member
  }

  /**
   * Let DiscordAnalytics declare the events necessary for its operation.
   * /!\ Not recommended for big bots
   * /!\ Not compatible with other functions
   * @param interactionNameResolver A function that will resolve the name of the interaction
   */
  public trackEvents(interactionNameResolver?: (interaction: any) => string): void {
    this.debug('[DISCORDANALYTICS] trackEvents() triggered');
    if (!this._isReady) throw new Error(ErrorCodes.INSTANCE_NOT_INITIALIZED);

    this._client.on('interactionCreate', async (interaction: any) => await this.trackInteractions(interaction, interactionNameResolver));
    this._client.on('guildCreate', async (guild: any) => this.trackGuilds(guild, 'create'));
    this._client.on('guildDelete', async (guild: any) => this.trackGuilds(guild, 'delete'));
  }
}
