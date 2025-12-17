# DiscordAnalytics for Oceanic.js

## Overview

This package is a wrapper for the Discord Analytics API made for Oceanic.js. It allows you to track events and send them to the Discord Analytics API.

## Installation

```bash
npm install @discordanalytics/oceanic
# or
yarn add @discordanalytics/oceanic
# or
pnpm add @discordanalytics/oceanic
```

## Usage

> **Note:** To use Discord Analytics, you need to have an API key. Check the docs for more informations : https://discordanalytics.xyz/docs/main/get-started/bot-registration

### Example

```js
// Import Discord.js's client and intents
const { Client } = require("oceanic.js");
// import discord-analytics
const { default: DiscordAnalytics } = require("@discordanalytics/oceanic");

// Create Discord client
// Don't forget to replace YOUR_BOT_TOKEN by your Discord bot token !
const client = new Client({
  auth: "Bot <YOUR_BOT_TOKEN>",
  gateway: {
    intents: ["GUILDS"], // This intent is required
  },
});

// Create Discord Analytics instance
// Don't forget to replace YOUR_API_KEY by your Discord Analytics key !
const analytics = new DiscordAnalytics({
  client: client,
  api_key: "YOUR_API_KEY",
});

// When Discord client is ready
client.on("ready", () => {
  console.log("Bot is ready!");

  analytics.init(); // Initialize the analytics
  analytics.trackEvents(); // Start tracking events
});

// Login to Discord
client.connect();
```
