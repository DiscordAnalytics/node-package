export enum LibType {
  DJS = "discord.js",
  ERIS = "eris"
}

export interface EventsToTrack {
  trackInteractions: boolean;
  trackGuilds: boolean;
  trackUserCount: boolean;
  trackUserLanguage: boolean;
  trackGuildsLocale: boolean;
}
export const ApiEndpoints = {
  BASE_URL: 'https://discordanalytics.xyz/api',
  EDIT_SETTINGS_URL: '/bots/:id',
  EDIT_STATS_URL: '/bots/:id/stats',
}

export const ErrorCodes = {
  INVALID_CLIENT_TYPE: 'Invalid client type, please use a valid client.',
  CLIENT_NOT_READY: 'Client is not ready, please start the client first.',
  INVALID_RESPONSE: 'Invalid response from the API, please try again later.',
  INVALID_API_TOKEN: 'Invalid API token, please get one at ' + ApiEndpoints.BASE_URL.split('/api')[0] + ' and try again.',
  DATA_NOT_SENT: "Data cannot be sent to the API, I will try again in a minute.",
  SUSPENDED_BOT: "Your bot has been suspended, please check your mailbox for more information.",
  INVALID_EVENTS_COUNT: "Invalid events count. Please enable at least one event to track.",
}
