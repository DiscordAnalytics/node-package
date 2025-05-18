# DiscordAnalytics for Discord.js-light

## Overview
This package is a wrapper for the Discord Analytics API made for Discord.js-light. It allows you to track events and send them to the Discord Analytics API.

## Installation
```bash
npm install @discordanalytics/discordjs-light
# or
yarn add @discordanalytics/discordjs-light
# or
pnpm add @discordanalytics/discordjs-light
```

## Usage
> **Note:** To use Discord Analytics, you need to have an API key. Check the docs for more informations : https://discordanalytics.xyz/docs/main/get-started/bot-registration

### Example
```js
// Import Discord.js's client
const { Client } = require("discord.js-light")
// import discord-analytics
const { default: DiscordAnalytics } = require("@discordanalytics/discordjs-light")

// Create Discord client
const client = new Client({
  intents: ["GUILD"] // This intent is required
});

// Create Discord Analytics instance
// Don't forget to replace YOUR_API_KEY by your Discord Analytics key !
const analytics = new DiscordAnalytics({
  client: client,
  api_key: 'YOUR_API_KEY',
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
// Don't forget to replace YOUR_BOT_TOKEN by your Discord bot token !
client.login('YOUR_BOT_TOKEN');
```
