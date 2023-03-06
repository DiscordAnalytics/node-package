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
}

export const ErrorCodes = {
    INVALID_CLIENT_TYPE: 'Invalid client type, please use a valid client.',
    CLIENT_NOT_READY: 'Client is not ready, please start the client first.'
}

export const ApiEndpoints = {
    BASE_URL: 'https://discord-analytics.vercel.app/api',
    TRACK_URL: '/track',
    ROUTES: {
        INTERACTIONS: '/interactions',
        MESSAGE_CREATE: '/message/create',
        MESSAGE_DELETE: '/message/delete',
        GUILD_CREATE: '/guild/create',
        GUILD_DELETE: '/guild/delete',
        USER_COUNT: '/user/count',
        USER_LANGUAGE: '/user/language'
    },
    METHODS: {
        POST: 'POST',
        GET: 'GET'
    }
}