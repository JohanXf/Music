const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'confess',
    category: 'Social',
    description: 'Send an anonymous confession from any channel.',
    args: false,
    usage: '<your confession>',
    owner: false,
    execute: async (message, args, client) => {
        const confession = args.join(" ");
        if (!confession) return message.reply("Please provide a confession!");

        const CONFESSION_CHANNEL_ID = '1514934915911651458';
        const LOG_CHANNEL_ID = '1514935116055707699';

        await message.delete().catch(() => {});

        const publicChannel = client.channels.cache.get(CONFESSION_CHANNEL_ID);
        if (publicChannel) {
            const publicEmbed = new EmbedBuilder()
                .setTitle('💬 New Confession')
                .setDescription(confession)
                .setColor('#D2B48C')
                .setTimestamp();
            await publicChannel.send({ embeds: [publicEmbed] });
        }

        const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setTitle('👤 Confession Log')
                .addFields(
                    { name: 'User', value: `${message.author.tag}`, inline: true },
                    { name: 'ID', value: `${message.author.id}`, inline: true },
                    { name: 'Message', value: confession }
                )
                .setColor('#FF0000')
                .setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
        }
    }
};
