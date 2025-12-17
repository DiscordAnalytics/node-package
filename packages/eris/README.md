# DiscordAnalytics for Eris

## Overview

This package is a wrapper for the Discord Analytics API made for Eris. It allows you to track events and send them to the Discord Analytics API.

## Installation

```bash
npm install @discordanalytics/eris
# or
yarn add @discordanalytics/eris
# or
pnpm add @discordanalytics/eris
```

## Usage

> **Note:** To use Discord Analytics, you need to have an API key. Check the docs for more informations : https://discordanalytics.xyz/docs/main/get-started/bot-registration

### Example

```js
const { Client } = require("eris");
const { default: DiscordAnalytics } = require("@discordanalytics/eris");

// Create Eris client.
// Don't forget to replace YOUR_BOT_TOKEN by your Discord bot token !
const bot = new Client("YOUR_BOT_TOKEN");

bot.on("ready", () => {
  // Create Discord Analytics instance
  // Don't forget to replace YOUR_API_KEY by your Discord Analytics key !
  const analytics = new DiscordAnalytics({
    client: client,
    api_key: "YOUR_API_KEY",
  });

  // start tracking selected events
  analytics.init(); // Initialize the analytics
  analytics.trackEvents();

  console.log("Ready!");
});

// Login to Discord
bot.connect();
```
