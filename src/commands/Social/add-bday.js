const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'add-bday',
    category: 'Social',
    description: 'Opens a form to add your birthday details.',
    execute: async (message, args, client) => {
        const embed = new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setTitle('🎂 Set Your Birthday')
            .setDescription('Click the button below to open the birthday form.');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('bday_button')
                .setLabel('Set Birthday')
                .setEmoji('🎂')
                .setStyle(ButtonStyle.Primary)
        );

        await message.reply({ embeds: [embed], components: [row] });
    }
};
