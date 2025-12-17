# DiscordAnalytics for Discord.js

## Overview

This package is a wrapper for the Discord Analytics API made for Discord.js. It allows you to track events and send them to the Discord Analytics API.

## Installation

```bash
npm install @discordanalytics/discordjs
# or
yarn add @discordanalytics/discordjs
# or
pnpm add @discordanalytics/discordjs
```

## Usage

> **Note:** To use Discord Analytics, you need to have an API key. Check the docs for more informations : https://discordanalytics.xyz/docs/main/get-started/bot-registration

### Example

```js
// Import Discord.js's client and intents
const { Client, IntentsBitField } = require("discord.js");
// import discord-analytics
const { default: DiscordAnalytics } = require("@discordanalytics/discordjs");

// Create Discord client
const client = new Client({
  intents: [IntentsBitField.Flags.Guilds], // This intent is required
});

// Create Discord Analytics instance
// Don't forget to replace YOUR_API_KEY by your Discord Analytics key !
const analytics = new DiscordAnalytics({
  client: client,
  api_key: "YOUR_API_KEY",
  sharded: false, // Set it to true if your bot use shards
});

// start tracking selected events

// When Discord client is ready
client.on("clientReady", async () => {
  console.log("Bot is ready!");
  await analytics.init(); // Initialize the analytics
  analytics.trackEvents(); // Start tracking events
});

// Login to Discord
// Don't forget to replace YOUR_BOT_TOKEN by your Discord bot token !
client.login("YOUR_BOT_TOKEN");
```
