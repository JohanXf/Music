const { EmbedBuilder } = require('discord.js');
const { runBirthdayCheck } = require('../../utils/runBirthdayCheck');
const config = require('../../config');

module.exports = {
    name: 'test-bday',
    category: 'Social',
    description: 'Manually trigger the birthday check. Owner only. Usage: !!test-bday [DD/MM]',
    args: false,
    owner: true,
    execute: async (message, args, client) => {
        // Owner-only guard
        if (!config.ownerID.includes(message.author.id)) {
            return message.reply('❌ Only the bot owner can use this command.');
        }

        // Optional date arg — defaults to today
        let dateStr = null;
        if (args[0]) {
            if (!/^\d{2}\/\d{2}$/.test(args[0])) {
                return message.reply('❌ Invalid date format. Use `DD/MM`, e.g. `12/06`.');
            }
            dateStr = args[0];
        } else {
            const today = new Date();
            dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;
        }

        const status = await message.reply(`🔍 Running birthday check for **${dateStr}**...`);

        const { wished, skipped } = await runBirthdayCheck(client, {
            dateStr,
            channelOverride: message.channel,
            // no wishedToday — test runs are always allowed to re-send
        });

        const embed = new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setTitle('🎂 Birthday Check Result')
            .addFields(
                {
                    name: '✅ Wished',
                    value: wished.length
                        ? wished.map(id => `<@${id}>`).join(', ')
                        : 'Nobody had a birthday today.',
                    inline: false,
                },
                {
                    name: '⏭️ Skipped',
                    value: skipped.length
                        ? skipped.map(id => `<@${id}> (not in any guild or already wished)`).join('\n')
                        : 'None',
                    inline: false,
                }
            )
            .setFooter({ text: `Checked date: ${dateStr}` })
            .setTimestamp();

        await status.edit({ content: '', embeds: [embed] });
    }
};
