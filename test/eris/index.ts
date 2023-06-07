import {Client, Constants, CommandInteraction, ComponentInteraction} from "eris";
import DiscordAnalytics, {LibType} from "../../lib";

const bot = new Client("");
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

  const analytics = new DiscordAnalytics(bot, LibType.ERIS, {
    trackGuilds: true,
    trackGuildsLocale: true,
    trackInteractions: true,
    trackUserCount: true,
    trackUserLanguage: true
  }, "")

  analytics.trackEvents();

  console.log("Ready!");
});

bot.connect();

bot.on("interactionCreate", async (interaction) => {
  if (interaction instanceof CommandInteraction) {
    if (interaction.data.name == "test") {
      if (interaction.data.options) {
        const option = interaction.data.options.find((option) => option.name === "test") as { value: string, type: number, name: string } | undefined;
        if (option) {
          if (option.value === "button") interaction.createMessage({
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
          else if (option.value === "select") interaction.createMessage({
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
        } else interaction.createMessage({
          content: "Test message",
          flags: 64
        })
      } else interaction.createMessage({
        content: "Test message",
        flags: 64
      })
    }
  }

  if (interaction instanceof ComponentInteraction) {
    if (interaction.data && interaction.data.component_type) {
      if (interaction.data.component_type === 2) interaction.createMessage({
        content: "Button clicked!",
        flags: 64
      })
      else if (interaction.data.component_type === 3) interaction.createMessage({
        content: "Select clicked!",
        flags: 64
      })
    }
  }

/*  if (interaction.isButton()) interaction.createMessage({
    content: "Button clicked!",
    ephemeral: true
  })

  if (interaction.isStringSelectMenu()) interaction.createMessage({
    content: "Select clicked!",
    ephemeral: true
  })

  if (interaction.isModalSubmit()) interaction.createMessage({
    content: "Modal submitted!",
    ephemeral: true
  })*/
})