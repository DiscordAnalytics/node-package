import DiscordAnalytics from '../src/index';
import {
  Application,
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
  ButtonStyles,
  Client,
  ComponentTypes,
  InteractionTypes,
  TextInputStyles
} from 'oceanic.js';
import 'dotenv/config';

const client = new Client({
  auth: `Bot ${process.env.DISCORD_TOKEN}`,
  gateway: {
    intents: ['GUILDS'],
  },
});

const analytics = new DiscordAnalytics({
  client,
  api_key: process.env.DISCORD_ANALYTICS_API_KEY as string,
  debug: true,
});

client.on('error', (error) => {
  console.error('Client error:', error);
});

client.on('ready', async () => {
  await client.application.createGlobalCommand({
    type: ApplicationCommandTypes.CHAT_INPUT,
    name: 'test',
    description: 'Do some tests',
    integrationTypes: [0, 1], // 0 = Guild Install, 1 = User Install
    contexts: [0, 1, 2], // 0 = Guild, 1 = Bot DM, 2 = Private Channel
    options: [{
      type: ApplicationCommandOptionTypes.STRING,
      name: 'type',
      description: 'Type of test',
      required: false,
      choices: [
        {
          name: 'Button',
          value: 'button',
        },
        {
          name: 'Select Menu',
          value: 'select_menu',
        },
        {
          name: 'Modal',
          value: 'modal',
        },
      ],
    }],
  });

  console.log('Client is ready!');

  await analytics.init();
});

client.on('interactionCreate', async (interaction) => {
  await analytics.trackInteractions(interaction, (interaction) => {
    if (interaction.type === InteractionTypes.APPLICATION_COMMAND)
      return interaction.commandName;
    else if (
      interaction.type === InteractionTypes.MESSAGE_COMPONENT
      || interaction.type === InteractionTypes.MODAL_SUBMIT
    ) {
      if ((/\d{17,19}/g).test(interaction.customId)) return 'this_awesome_button';
      else return interaction.customId;
    }
    return '';
  });

  if (interaction.isCommandInteraction() && interaction.data.name === 'test') {
    const option = interaction.data.options.getString('type', false);

    if (option === 'button') interaction.reply({
      content: 'Here is the button!',
      components: [{
        type: ComponentTypes.ACTION_ROW,
        components: [{
          type: ComponentTypes.BUTTON,
          style: ButtonStyles.PRIMARY,
          label: 'Test button',
          customID: `button_${interaction.user.id}`,
        }],
      }],
    });

    else if (option === 'select_menu') interaction.reply({
      content: 'Here is the select menu!',
      components: [{
        type: ComponentTypes.ACTION_ROW,
        components: [{
          type: ComponentTypes.STRING_SELECT,
          placeholder: 'Select an option',
          customID: 'test_select',
          options: [{
            label: 'Test select',
            value: 'test_select',
          }],
        }],
      }],
    });

    else if (option === 'modal') interaction.createModal({
      title: 'This is a test modal',
      customID: 'test_modal',
      components: [{
        type: ComponentTypes.ACTION_ROW,
        components: [{
          type: ComponentTypes.TEXT_INPUT,
          customID: 'test_input',
          label: 'Test input',
          style: TextInputStyles.SHORT,
          placeholder: 'Test input',
          required: true,
        }],
      }],
    });

    else interaction.reply({
      content: 'Please select a type of test',
    });
  } else if (interaction.isComponentInteraction()) {
    if (interaction.data.componentType === ComponentTypes.BUTTON) interaction.reply({
      content: `You clicked the button! ${interaction.data.customID}`,
    });

    else if (interaction.data.componentType === ComponentTypes.STRING_SELECT) await interaction.message.edit({
      content: `You selected the option! ${interaction.data.values.raw[0]}`,
      components: [],
    });
  } else if (interaction.isModalSubmitInteraction()) {
    const input = interaction.data.components.getComponents()[0].customID;
    interaction.reply({
      content: `You submitted the modal! ${input}`,
    });
  }
});

client.on('guildCreate', (_) => analytics.trackGuilds('create'));
client.on('guildDelete', (_) => analytics.trackGuilds('delete'));

client.connect();
