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
  BASE_URL: 'https://discord-analytics.com/api', // TODO: Change the URL when we have a domain
  TRACK_URL: '/track',
  EDIT_SETTINGS_URL: '/bot/settings',
  ROUTES: {
    INTERACTIONS: '/interactions',
    GUILDS: '/guilds',
  }
}

export const ErrorCodes = {
  INVALID_CLIENT_TYPE: 'Invalid client type, please use a valid client.',
  CLIENT_NOT_READY: 'Client is not ready, please start the client first.',
  INVALID_RESPONSE: 'Invalid response from the API, please try again later.',
  INVALID_API_TOKEN: 'Invalid API token, please gen one at ' + ApiEndpoints.BASE_URL.split('/api')[0] + 'and try again.',
  DATA_NOT_SENT: "Data cannot be sent to the API, I will try again later."
}
