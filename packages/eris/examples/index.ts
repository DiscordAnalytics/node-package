import DiscordAnalytics from "../src/index"; // Replace it with @discordanalytics/discordjs-light in your project
import {
  Client,
  CommandInteraction,
  ComponentInteraction,
  Constants,
  ModalSubmitInteraction,
} from "eris";
import "dotenv/config";

const client = new Client(process.env.DISCORD_TOKEN as string, {
  intents: ["guilds"],
});

client.on("error", (error) => {
  console.error("Client error:", error);
});

const analytics = new DiscordAnalytics({
  client,
  api_key: process.env.DISCORD_ANALYTICS_API_KEY as string,
  debug: true,
});

client.on("ready", async () => {
  client.createCommand({
    name: "test",
    description: "Send a test message",
    dmPermission: true,
    type: Constants.ApplicationCommandTypes.CHAT_INPUT,
    options: [
      {
        name: "test",
        description: "Test option",
        type: Constants.ApplicationCommandOptionTypes.STRING,
        required: false,
        choices: [
          { name: "button", value: "button" },
          { name: "select", value: "select" },
          { name: "modal", value: "modal" },
        ],
      },
    ],
  });

  console.log("Client is ready!");

  await analytics.init();
});

client.on("interactionCreate", async (interaction) => {
  await analytics.trackInteractions(interaction, (interaction) => {
    if (interaction.type === Constants.InteractionTypes.APPLICATION_COMMAND)
      return interaction.commandName;
    else if (
      interaction.type === Constants.InteractionTypes.MESSAGE_COMPONENT ||
      interaction.type === Constants.InteractionTypes.MODAL_SUBMIT
    ) {
      if (/\d{17,19}/g.test(interaction.customId)) return "this_awesome_button";
      else return interaction.customId;
    }
    return "";
  });

  if (interaction instanceof CommandInteraction) {
    if (interaction.data.name === "test") {
      const option = interaction.data.options?.find(
        (o) => o.name === "test",
      ) as { value: string; type: number; name: string } | undefined;

      if (option && option.value === "button")
        await interaction.createMessage({
          content: "Test button",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 1,
                  label: "Test button",
                  custom_id: `button_${interaction.user?.id}`,
                },
              ],
            },
          ],
        });
      else if (option && option.value === "select")
        await interaction.createMessage({
          content: "Test select",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 3,
                  custom_id: "test_select",
                  options: [
                    {
                      label: "Test select",
                      value: "test_select",
                    },
                  ],
                },
              ],
            },
          ],
        });
      else if (option && option.value === "modal")
        await interaction.createModal({
          custom_id: `my_modal`,
          title: "My modal",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: "favorite_color_input",
                  label: "What's your favorite color?",
                  style: 1,
                },
              ],
            },
          ],
        });
      else
        await interaction.createMessage({
          content: "This is a test message",
          flags: Constants.MessageFlags.EPHEMERAL,
        });
    }
  }

  if (interaction instanceof ComponentInteraction) {
    if (interaction.data && interaction.data.component_type) {
      if (interaction.data.component_type === 2) {
        await interaction.createMessage({
          content: `You clicked the button with ID: ${interaction.data.custom_id}`,
          flags: Constants.MessageFlags.EPHEMERAL,
        });
      } else if (interaction.data.component_type === 3) {
        await interaction.editOriginalMessage({
          content: `You selected: ${interaction.data.values[0]}`,
          components: [],
        });
      }
    }
  }

  if (interaction instanceof ModalSubmitInteraction) {
    const favoriteColor = interaction.data.components[0].components[0].value;
    await interaction.createMessage({
      content: `Your favorite color is: ${favoriteColor}`,
      flags: Constants.MessageFlags.EPHEMERAL,
    });
  }
});

client.on("guildCreate", (_) => analytics.trackGuilds("create"));
client.on("guildDelete", (_) => analytics.trackGuilds("delete"));

client.connect();
