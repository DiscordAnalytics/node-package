export enum LibType {
  DJS,
  ERIS
}

export interface EventsToTrack {
  trackInteractions: boolean;
  trackGuilds: boolean;
  trackUserCount: boolean;
  trackUserLanguage: boolean;
  trackGuildsLocale: boolean;
}
export const ApiEndpoints = {
  BASE_URL: 'http://discordanalytics.xyz/api',
  EDIT_SETTINGS_URL: '/bot/:id/track',
  ROUTES: {
    INTERACTIONS: '/bot/:id/track/interactions',
    GUILDS: '/bot/:id/track/guilds',
  }
}

export const ErrorCodes = {
  INVALID_CLIENT_TYPE: 'Invalid client type, please use a valid client.',
  CLIENT_NOT_READY: 'Client is not ready, please start the client first.',
  INVALID_RESPONSE: 'Invalid response from the API, please try again later.',
  INVALID_API_TOKEN: 'Invalid API token, please get one at ' + ApiEndpoints.BASE_URL.split('/api')[0] + 'and try again.',
  DATA_NOT_SENT: "Data cannot be sent to the API, I will try again later.",
  SUSPENDED_BOT: "Your bot has been suspended, please check your mailbox for more information."
}
