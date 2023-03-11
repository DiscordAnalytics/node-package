export enum LibType {
  DJS,
  ERIS
}

export interface EventsToTrack {
  trackInteractions: boolean;
  trackMessageCreate: boolean;
  trackMessageDelete: boolean;
  trackGuildDelete: boolean;
  trackGuildCreate: boolean;
  trackUserCount: boolean;
  trackUserLanguage: boolean;
  trackGuildsLocale: boolean;
}

export const ErrorCodes = {
  INVALID_CLIENT_TYPE: 'Invalid client type, please use a valid client.',
  CLIENT_NOT_READY: 'Client is not ready, please start the client first.',
  INVALID_RESPONSE: 'Invalid response from the API, please try again later.',
}

export const ApiEndpoints = {
  BASE_URL: 'https://discord-analytics.com/api', // TODO: Change the URL when we have a domain
  TRACK_URL: '/track',
  ROUTES: {
    INTERACTIONS: '/interactions',
    MESSAGE_CREATE: '/message/create',
    MESSAGE_DELETE: '/message/delete',
    GUILD_CREATE: '/guild/create',
    GUILD_DELETE: '/guild/delete',
    USER_COUNT: '/user/count',
    USER_LANGUAGE: '/user/language'
  }
}