# Discord Analytics

## Installing the package

```bash
npm install discord-analytics
```

## Usage

> **Note:** To use Discord Analytics, you need to have an API token. Check the docs for more informations : https://discordanalytics.xyz/docs/main/get-started/bot-registration

**With Discord.js:**

```js
// Import Discord.js's client and intents
const { Client, IntentsBitField } = require("discord.js")
// import discord-analytics
const { default: DiscordAnalytics } = require("discord-analytics/discordjs")

// Create Discord client
const client = new Client({
    intents: [IntentsBitField.Flags.Guilds] // This intent is required
});

// Create Discord Analytics instance
// Don't forget to replace YOUR_API_TOKEN by your Discord Analytics token !
const analytics = new DiscordAnalytics({
    client: client,
    apiToken: 'YOUR_API_TOKEN',
    sharded: false // Set it to true if your bot use shards
});

// start tracking selected events

// When Discord client is ready
client.on('ready', () => {
    console.log("Bot is ready!");
    analytics.init(); // Initialize the analytics
    analytics.trackEvents(); // Start tracking events
});

// Login to Discord
// Don't forget to replace token by your Discord bot token !
client.login('token');
```

**With Eris:**

```js
const {Client} = require("eris");
const {default: DiscordAnalytics} = require("discord-analytics/eris");

// Create Eris client.
// Don't forget to replace token by your Discord bot token !
const bot = new Client("token");

bot.on("ready", () => {
    // Create Discord Analytics instance
    // Don't forget to replace YOUR_API_TOKEN by your Discord Analytics token !
    const analytics = new DiscordAnalytics({
        client: client,
        apiToken: 'YOUR_API_TOKEN'
    });

    // start tracking selected events
    analytics.init(); // Initialize the analytics
    analytics.trackEvents();

    console.log("Ready!");
});

// Login to Discord
bot.connect();
```

**With Oceanic.js:**
```js
// Import Discord.js's client and intents
const { Client } = require("oceanic.js")
// import discord-analytics
const { default: DiscordAnalytics } = require("discord-analytics/oceanic")

// Create Discord client
const client = new Client({
  auth: "Bot <YOUR_BOT_TOKEN>",
  gateway: {
    intents: ["GUILDS"] // This intent is required
  }
})

// Create Discord Analytics instance
// Don't forget to replace YOUR_API_TOKEN by your Discord Analytics token !
const analytics = new DiscordAnalytics({
  client: client,
  apiToken: 'YOUR_API_TOKEN'
});

// When Discord client is ready
client.on('ready', () => {
  console.log("Bot is ready!");

  analytics.init(); // Initialize the analytics
  analytics.trackEvents(); // Start tracking events
});

// Login to Discord
// Don't forget to replace token by your Discord bot token !
client.login('token');
```

> For advanced usages and updated docs, please check https://discordanalytics.xyz/docs/main/get-started/installation