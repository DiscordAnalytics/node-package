import DiscordAnalytics, { LibType } from "../../lib";
import { Client } from 'discord.js';

const client = new Client({
  intents: []
});

const analytics = new DiscordAnalytics(client, LibType.DJS, {
  trackGuilds: true,
  trackGuildsLocale: true,
  trackInteractions: true,
  trackUserCount: true,
  trackUserLanguage: true,
}, ""); // token de IgeCorp Canary

client.on("ready", () => {
  analytics.trackEvents();
  console.log("Bot is ready!");
});

client.login("");


