import { InteractionType } from '@discordanalytics/core';
import DiscordAnalytics from '../src/index'; // Replace it with @discordanalytics/discordjs-light in your project
import { Client, Message, MessageActionRow, Modal, TextInputComponent } from 'discord.js-light';
import 'dotenv/config';

const client = new Client({
  intents: ['GUILDS'],
});

client.on('error', (error) => {
  console.error('Client error:', error);
});

const analytics = new DiscordAnalytics({
  client,
  api_key: process.env.DISCORD_ANALYTICS_API_KEY as string,
  sharded: false, // Set to true if using ShardingManager
  debug: true,
});

client.on('ready', async () => {
  client.application?.commands.set([{
    name: 'test',
    description: 'Send a test message',
    dmPermission: true,
    options: [{
      name: 'test',
      description: 'Test option',
      type: 3,
      required: false,
      autocomplete: true,
    }]
  }]);

  console.log('Client is ready!');

  await analytics.init();
});

client.on('interactionCreate', async (interaction) => {
  await analytics.trackInteractions(interaction, (interaction) => {
    if (interaction.type === InteractionType.ApplicationCommand)
      return interaction.commandName;
    else if (
      interaction.type === InteractionType.MessageComponent
      || interaction.type === InteractionType.ModalSubmit
    ) {
      if ((/\d{17,19}/g).test(interaction.customId)) return 'this_awesome_button';
      else return interaction.customId;
    }
    return '';
  });

  if (interaction.isCommand()) {
    if (interaction.commandName === 'test') {
      const option = interaction.options.getString('test');

      if (option === 'button') interaction.reply({
        content: 'Test button',
        components: [{
          type: 1,
          components: [{
            type: 2,
            style: 1,
            label: 'Test button',
            customId: `button_${interaction.user.id}`,
          }],
        }],
      });

      else if (option === 'select') interaction.reply({
        content: 'Test select',
        components: [{
          type: 1,
          components: [{
            type: 3,
            customId: 'test_select',
            options: [{
              label: 'Test select',
              value: 'test_select',
            }],
          }],
        }],
      });

      else if (option === 'modal') {
        const modal = new Modal()
          .setCustomId(`my_modal`)
          .setTitle('My modal');

        const favoriteColorInput = new TextInputComponent()
          .setCustomId('favorite_color_input')
          .setLabel('What\'s your favorite color?')
          .setStyle('SHORT');

        const actionRow = new MessageActionRow<TextInputComponent>().addComponents(favoriteColorInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
      }

      else interaction.reply({
        content: 'This is a test message',
        ephemeral: true,
      });
    }
  }

  if (interaction.isAutocomplete()) {
    const focusedValue = interaction.options.getFocused();
    const choices = ['button', 'select', 'modal'];
    const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice })),
    );
  }

  if (interaction.isButton()) interaction.reply({
    content: `You clicked the button with ID: ${interaction.customId}`,
    ephemeral: true,
  });

  if (interaction.isSelectMenu()) await (interaction.message as Message).edit({
    content: `You selected: ${interaction.values[0]}`,
    components: [],
  });

  if (interaction.isModalSubmit()) {
    const favoriteColor = interaction.fields.getTextInputValue('favorite_color_input');
    await interaction.reply({
      content: `Your favorite color is: ${favoriteColor}`,
      ephemeral: true,
    });
  }
});

client.on('guildCreate', (_) => analytics.trackGuilds('create'));
client.on('guildDelete', (_) => analytics.trackGuilds('delete'));

client.login(process.env.DISCORD_TOKEN);
