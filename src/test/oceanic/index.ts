// @ts-nocheck

import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
  ButtonStyles,
  Client,
  ComponentTypes,
  TextInputStyles,
} from "oceanic.js";
import DiscordAnalytics from "../../oceanic";
import {config} from "dotenv";

config()

const client = new Client({
  auth: `Bot ${process.env.DISCORD_TOKEN}`,
  gateway: {
    intents: ["GUILDS"]
  }
})

const analytics = new DiscordAnalytics({
  client: client,
  apiToken: process.env.DA_TOKEN,
  debug: true
})

analytics.trackEvents()

client.on("ready", async () => {
  await client.application.createGlobalCommand({
    type: ApplicationCommandTypes.CHAT_INPUT,
    name: "test",
    description: "Do some tests",
    options: [
      {
        type: ApplicationCommandOptionTypes.STRING,
        name: "type",
        description: "The type of the test.",
        choices: [
          {
            name: "button",
            value: "button"
          },
          {
            name: "select_menu",
            value: "select"
          },
          {
            name: "modal",
            value: "modal"
          }
        ],
        required: false
      }
    ]
  })

  console.log(`Connected as ${client.user.tag}`)
})

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommandInteraction() && interaction.data.name === "test") {
    const option = interaction.data.options.getString("test", false)
    if (option === "button") interaction.reply({
      content: "Here is the button!",
      components: [
        {
          type: ComponentTypes.ACTION_ROW,
          components: [
            {
              type: ComponentTypes.BUTTON,
              customID: "test_button",
              label: "Test button",
              style: ButtonStyles.PRIMARY
            }
          ]
        }
      ]
    })
    else if (option === "select") interaction.reply({
      content: "Here is the button!",
      components: [
        {
          type: ComponentTypes.ACTION_ROW,
          components: [
            {
              type: ComponentTypes.STRING_SELECT,
              placeholder: "Test select",
              customID: "test_select",
              options: [
                {
                  label: "test select",
                  value: "test_select"
                }
              ]
            }
          ]
        }
      ]
    })
    else if (option === "modal") {
        interaction.createModal({
          title: "This is the modal",
          components: [
            {
              type: ComponentTypes.ACTION_ROW,
              components: [
                {
                  type: ComponentTypes.TEXT_INPUT,
                  customID: "text-input",
                  label: "Some Label Here",
                  placeholder: "Some Placeholder Here",
                  required: true,
                  style: TextInputStyles.SHORT
                }
              ]
            }
          ],
          customID: "modal"
        })
    }
    else interaction.reply({
      content: "Test command!"
    })
  } else if (interaction.isComponentInteraction()) {
    if (interaction.data.componentType === ComponentTypes.BUTTON) interaction.reply({
      content: "Button clicked!"
    })
    else if (interaction.data.componentType === ComponentTypes.STRING_SELECT) {
      interaction.reply({
        content: "Select menu clicked!"
      })

      await interaction.message.edit({
        content: interaction.message.content,
        components: interaction.message.components
      })
    }
  } else if (interaction.isModelSubmitInteraction()) {
    interaction.reply({
      content: "Modal submitted!"
    })
  }
})

client.on("guildCreate", async (guild) => await analytics.trackGuilds(guild, "create"))

client.on("guildDelete", async (guild) => await analytics.trackGuilds(guild, "delete"))

client.connect()