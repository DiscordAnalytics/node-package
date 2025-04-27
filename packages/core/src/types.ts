export const api_url = 'https://discordanalytics.xyz/api';
export const ApiEndpoints = {
  EDIT_SETTINGS_URL: `${api_url}/bots/:id`,
  EDIT_STATS_URL: `${api_url}/bots/:id/stats`,
  EVENT_URL: `${api_url}/bots/:id/events/:event`,
}

export const ErrorCodes = {
  INVALID_CLIENT_TYPE: 'Invalid client type, please use a valid client.',
  CLIENT_NOT_READY: 'Client is not ready, please start the client first.',
  INVALID_RESPONSE: 'Invalid response from the API, please try again later.',
  INVALID_API_TOKEN: 'Invalid API token, please get one at ' + api_url.split('/api')[0] + ' and try again.',
  DATA_NOT_SENT: "Data cannot be sent to the API, I will try again in a minute.",
  SUSPENDED_BOT: "Your bot has been suspended, please check your mailbox for more information.",
  INSTANCE_NOT_INITIALIZED: "It seem that you didn't initialize your instance. Please check the docs for more informations.",
  INVALID_EVENTS_COUNT: "invalid events count",
  INVALID_VALUE_TYPE: "invalid value type",
  INVALID_EVENT_KEY: "invalid event key",
}

export type Locale = 'id' | 'en-US' | 'en-GB' | 'bg' | 'zh-CN' | 'zh-TW' | 'hr' | 'cs' | 'da' | 'nl' | 'fi' | 'fr' | 'de' | 'el' | 'hi' | 'hu' | 'it' | 'ja' | 'ko' | 'lt' | 'no' | 'pl' | 'pt-BR' | 'ro' | 'ru' | 'es-ES' | 'sv-SE' | 'th' | 'tr' | 'uk' | 'vi';

export enum InteractionType {
  Ping = 1,
  ApplicationCommand,
  MessageComponent,
  ApplicationCommandAutocomplete,
  ModalSubmit,
}

export enum ApplicationCommandType {
  ChatInputCommand = 1,
  UserCommand,
  MessageCommand,
}

export interface InteractionData {
  name: string;
  number: number;
  type: InteractionType;
  command_type?: ApplicationCommandType;
}

export interface LocaleData {
  locale: Locale;
  number: number;
}

export interface GuildsStatsData {
  guildId: string;
  name: string;
  icon: string | null;
  members: number;
  interactions: number;
}

export interface AnalyticsOptions {
  client: any;
  api_key: string;
  sharded?: boolean;
  debug?: boolean;
}

export type TrackGuildType = "create" | "delete";
