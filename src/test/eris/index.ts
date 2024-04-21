// @ts-nocheck

import {Client, Constants, CommandInteraction, ComponentInteraction} from "eris";
import DiscordAnalytics from "../../eris";

const bot = new Client("YOUR_DISCORD_TOKEN", {
  intents: ["guilds"]
});

const analytics = new DiscordAnalytics({
  client: bot,
  apiToken: 'YOUR_API_TOKEN',
  debug: true
});

bot.on("ready", () => {
  bot.createCommand({
    name: "test",
    description: "Send test message",
    type: Constants.ApplicationCommandTypes.CHAT_INPUT,
    options: [{
      name: "test",
      description: "Test option",
      type: Constants.ApplicationCommandOptionTypes.STRING,
      required: false,
      choices: [{
        name: "Button",
        value: "button"
      },{
        name: "Select",
        value: "select"
      }]
    }]
  })

  analytics.init()

  console.log("Ready!");
});

bot.connect();

bot.on("interactionCreate", async (interaction) => {
  await analytics.trackInteractions(interaction)
  if (interaction instanceof CommandInteraction) {
    if (interaction.data.name == "test") {
      if (interaction.data.options) {
        const option = interaction.data.options.find((option) => option.name === "test") as { value: string, type: number, name: string } | undefined;
        if (option) {
          if (option.value === "button") await interaction.createMessage({
            content: "Test button",
            components: [{
              type: 1,
              components: [{
                type: 2,
                style: 1,
                label: "Test button",
                custom_id: "test_button"
              }]
            }]
          })
          else if (option.value === "select") await interaction.createMessage({
            content: "Test select",
            components: [{
              type: 1,
              components: [{
                type: 3,
                custom_id: "test_select",
                options: [{
                  label: "Test select",
                  value: "test_select"
                }]
              }]
            }]
          })
        } else await interaction.createMessage({
          content: "Test message",
          flags: 64
        })
      } else await interaction.createMessage({
        content: "Test message",
        flags: 64
      })
    }
  }

  if (interaction instanceof ComponentInteraction) {
    if (interaction.data && interaction.data.component_type) {
      if (interaction.data.component_type === 2) await interaction.createMessage({
        content: "Button clicked!",
        flags: 64
      })
      else if (interaction.data.component_type === 3) await interaction.createMessage({
        content: "Select clicked!",
        flags: 64
      })
    }
  }
})

bot.on("guildCreate", async (guild) => await analytics.trackGuilds(guild, "create"))

bot.on("guildDelete", async (guild) => await analytics.trackGuilds(guild, "delete"))