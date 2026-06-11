const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const emojis = require('../../base/emoji.json'); // Ensure your emojis are here

module.exports = {
  name: 'helpo',
  category: 'General',
  aliases: ['helppo', 'ho'],
  cooldown: 5,
  description: 'Help with all commands, or one specific command.',
  execute: async (message, args, client, prefix) => {
    
    // 1. Group commands dynamically
    const categories = {};
    client.commands.forEach((cmd) => {
      if (!cmd.category) return;
      if (!categories[cmd.category]) categories[cmd.category] = [];
      categories[cmd.category].push(`\`${cmd.name}\``);
    });

    // 2. Build Category Embeds
    const categoryEmbeds = {};
    Object.keys(categories).forEach((cat, index) => {
      categoryEmbeds[`h${index + 2}`] = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({ name: message.guild.name, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTitle(`- ${cat} Commands`)
        .setDescription(categories[cat].join(', '))
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
    });

    // 3. Create Main Help Menu
    const helpmenu = new EmbedBuilder()
        .setAuthor({ name: message.guild.name, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`**Hey!!** <@${message.author.id}>, I am <@${client.user.id}>\n~ Prefix: ${prefix}\n~ Total Commands: \`${client.commands.size}\``)
        .addFields(Object.keys(categories).map(cat => ({
            name: `${emojis[cat] || '📁'} ${cat}`,
            value: `View ${cat} commands`,
            inline: true
        })))
        .setColor(client.ankushcolor);

    // 4. Build Select Menu Options dynamically
    const options = Object.keys(categories).map((cat, index) => ({
      label: cat,
      value: `h${index + 2}`,
      emoji: emojis[cat] || '📁'
    }));
    options.unshift({ label: 'Home', value: 'h1', emoji: '🏠' }); // Add Home

    const row1 = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('helpop')
        .setPlaceholder('❯ SELECT A CATEGORY')
        .addOptions(options)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Invite Me').setURL('...').setStyle(ButtonStyle.Link),
      new ButtonBuilder().setLabel('Support Server').setURL('...').setStyle(ButtonStyle.Link)
    );

    const msg = await message.channel.send({ embeds: [helpmenu], components: [row1, row2] });

    // 5. Collector
    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 60000
    });

    collector.on('collect', async (i) => {
      if (i.values[0] === 'h1') return i.update({ embeds: [helpmenu] });
      const targetEmbed = categoryEmbeds[i.values[0]];
      if (targetEmbed) return i.update({ embeds: [targetEmbed] });
    });
  }
};
