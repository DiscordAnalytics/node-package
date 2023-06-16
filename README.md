# Discord Analytics

## Installing the package

```bash
npm install discord-analytics
```

## Usage

> **Note:** To use Discord Analytics, you need to have an API token. Check the docs for more informations : https://docs.discordanalytics.xyz/get-started/bot-registration

**With Discord.js:**

```js
// Import Discord.js's client and intents
const { Client, GatewayIntentBits.Guilds } = require("discord.js")
// import discord-analytics
const { LibType, default: DiscordAnalytics } = require("discord-analytics")

// Create Discord client
const client = new Client();

// When Discord client is ready
client.on('ready', () => {
  // Create Discord Analytics instance
  // Don't forget to replace YOUR_API_TOKEN by your Discord Analytics token !
  const analytics = new DiscordAnalytics(client, LibType.DJS, {
    trackGuilds: true,
    trackGuildsLocale: true,
    trackInteractions: true,
    trackUserCount: true,
    trackUserLanguage: true,
  }, "YOUR_API_TOKEN");
  
  // start tracking selected events
  analytics.trackEvents();

  console.log("Bot is ready!");
});

// Login to Discord
// Don't forget to replace token by your Discord bot token !
client.login('token');
```

**With Eris:**

```js
const {Client, Constants, CommandInteraction, ComponentInteraction} from "eris";
const {LibType, default: DiscordAnalytics} = require("../../lib");

// Create Eris client.
// Don't forget to replace token by your Discord bot token !
const bot = new Client("token");

bot.on("ready", () => {
  // Create Discord Analytics instance
  // Don't forget to replace YOUR_API_TOKEN by your Discord Analytics token !
  const analytics = new DiscordAnalytics(client, LibType.ERIS, {
    trackGuilds: true,
    trackGuildsLocale: true,
    trackInteractions: true,
    trackUserCount: true,
    trackUserLanguage: false, // not supported
  }, "YOUR_API_TOKEN");

  // start tracking selected events
  analytics.trackEvents();

  console.log("Ready!");
});

// Login to Discord
bot.connect();
```

