// @ts-nocheck

import DiscordAnalytics from "../../discordjs";
import { ActionRowBuilder, Client, IntentsBitField, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import {config} from "dotenv";
import {InteractionType} from "../../utils/types";

config()

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds]
})

client.on("error", (e) => {
  console.log(e)
})

const analytics = new DiscordAnalytics({
  client: client,
  apiToken: process.env.DA_TOKEN,
  sharded: false,
  debug: true
});

client.on("ready", async () => {
  client.application?.commands.set([{
    name: "test",
    description: "Send test message",
    dmPermission: true,
    options: [{
      name: "test",
      description: "Test option",
      type: 3,
      required: false,
      autocomplete: true
    }]
  }])

  console.log("Bot is ready!");

  await analytics.init()
});

client.on("interactionCreate", async (interaction: Interaction) => {
  await analytics.trackInteractions(interaction, (int) => {
    if (interaction.type === InteractionType.ApplicationCommand)
      return interaction.commandName
    else if (interaction.type === InteractionType.MessageComponent || interaction.type === InteractionType.ModalSubmit) {
      if ((/\d{17,19}/g).test(interaction.customId)) return "this_awesome_button"
      else return interaction.customId
    }
    return ""
  })
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "test") {
      const option = interaction.options.getString("test");
      if (option === "button") interaction.reply({
        content: "Test button",
        components: [{
          type: 1,
          components: [{
            type: 2,
            style: 1,
            label: "Test button",
            custom_id: `button_${interaction.user.id}`
          }]
        }]
      })
      else if (option === "select") interaction.reply({
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
      else if (option === "modal") {
        const modal = new ModalBuilder()
        .setCustomId('myModal')
        .setTitle('My Modal');

        // Add components to modal

        // Create the text input components
        const favoriteColorInput = new TextInputBuilder()
          .setCustomId('favoriteColorInput')
            // The label is the prompt the user sees for this input
          .setLabel("What's your favorite color?")
            // Short means only a single line of text
          .setStyle(TextInputStyle.Short);

        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput) as ActionRowBuilder<TextInputBuilder>;

        // Add inputs to the modal
        modal.addComponents(firstActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);
      } else interaction.reply({
        content: "Test message",
        ephemeral: true
      })
    }
  }

  if (interaction.isAutocomplete()) {
    const focusedValue = interaction.options.getFocused();
		const choices = ["button", "select", "modal"];
		const filtered = choices.filter(choice => choice.startsWith(focusedValue));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
  }

  if (interaction.isButton()) interaction.reply({
    content: "Button clicked!",
    ephemeral: true
  })

  if (interaction.isStringSelectMenu()) {
    await interaction.reply({
      content: "Select clicked!",
      ephemeral: true
    })
    await interaction.message.edit()
  }

  if (interaction.isModalSubmit()) interaction.reply({
    content: "Modal submitted!",
    ephemeral: true
  })
})

client.on("guildCreate", async (guild) => await analytics.trackGuilds(guild, "create"))

client.on("guildDelete", async (guild) => await analytics.trackGuilds(guild, "delete"))

client.login(process.env.DISCORD_TOKEN);