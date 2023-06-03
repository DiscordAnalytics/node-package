import {Client, Constants, Interaction, CommandInteraction} from "eris";
import DiscordAnalytics, {LibType} from "../../lib";

const bot = new Client("MTA4MjYxNTc3NTYxOTE5OTA1Nw.GXrcMj.j2caJVZ65YhGL8ioLyuSUtJkL1htZd_kpYpDrU");
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
  }, "98bc82253d607bb787f48fba77717ad11be574d6724f607b9c")

  analytics.trackEvents();

  console.log("Ready!");
});
bot.on("interactionCreate", async (interaction) => {
  if (interaction instanceof CommandInteraction) {
    if (interaction.data.name == "test") {
      const option = interaction.data.options?.find((x) => x.name === "test") as any;
      if (option && option.value) {
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
        else interaction.createMessage({
            content: "Test message"
          })
      }
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

bot.connect();
