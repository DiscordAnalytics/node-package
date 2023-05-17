import DiscordAnalytics, {LibType} from  "../../lib";
import { Client, Interaction } from "discord.js";

const client = new Client({
  intents: []
})

client.on("ready", () => {
  client.application?.commands.set([{
    name: "ping",
    description: "Pong!"
  }])
  
  const analytics = new DiscordAnalytics(client, LibType.DJS, {
    trackGuilds: true,
    trackGuildsLocale: true,
    trackInteractions: true,
    trackUserCount: true,
    trackUserLanguage: true,
  }, "YOUR_API_TOKEN");
  
  analytics.trackEvents();

  console.log("Bot is ready!");
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "ping") interaction.reply("Pong!")
  }
})

client.login("YOUR_DISCORD_BOT_TOKEN");


