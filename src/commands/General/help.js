const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const emojis = require('../../base/emoji.json');

const HIDDEN_CATEGORIES = ['Dev', 'Owner'];
const COLLECTOR_TIMEOUT = 120_000;

function getCategoryEmoji(category) {
  return emojis[category.toLowerCase()] ?? '❓';
}

function buildCategoryEmbed(category, commands, client, message) {
  const emoji = getCategoryEmoji(category);
  const commandList = commands.map(c => `\`${c.name}\``).join(',  ');
  return new EmbedBuilder()
    .setColor(client.ankushcolor)
    //.setAuthor({ name: message.guild.name, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
    //.setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
    .setTitle(`${emoji}  ${category} Commands`)
    .setDescription(commandList || 'No commands available.')
    .setFooter({ text: `${commands.length} command${commands.length !== 1 ? 's' : ''} in this category` })
    .setTimestamp();
}

function buildHomeEmbed(client, message, prefix, grouped) {
  const categoryLines = Object.entries(grouped)
    .map(([cat]) => `${getCategoryEmoji(cat)}  **${cat}**`)
    .join('\n');
  return new EmbedBuilder()
    .setColor(client.ankushcolor)
    //.setAuthor({ name: message.guild.name, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
    //.setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
    //.setTitle(`${client.user.username} — Help Menu`)
    .setDescription(
      `# ${client.user.username} — Help Menu\nExperience the next level of server interaction with ${client.user.username}. Designed to bring high-quality utility and entertainment directly to your server, ${client.user.username} is the ultimate companion for music lovers, community builders, and power users.\n\n` +
      `**Prefix:** \`${prefix}\`  •  **Commands:** \`${client.commands.size}\`\n\n` +
      `**Categories:**\n${categoryLines}\n\n` + `**[Invite BOT](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&integration_type=0&scope=bot+applications.commands) || [Support HQ](https://discord.com/invite/w77ymEU82a)**` )
    /*.addFields({
      name: '🔗 Links',
      value: `[Invite Me](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&integration_type=0&scope=bot+applications.commands) • [Support HQ](https://discord.com/invite/w77ymEU82a)`,
    })*/
    .setFooter({
text: "Develope with 💜 by FaizenSosuke",
iconURL: "https://cdn.discordapp.com//avatars/1512092900014555151/e727ec79581ff856222f27bffdcad390.webp?size=4096"
});
}

function buildAllCommandsEmbed(client, message, grouped) {
  const sections = Object.entries(grouped)
    .map(([cat, cmds]) => {
      const emoji = getCategoryEmoji(cat);
      const list = cmds.map(c => `\`${c.name}\``).join('  ');
      return `**${emoji} ${cat}**\n${list}`;
    })
    .join('\n\n');
  return new EmbedBuilder()
    .setColor(client.ankushcolor)
    //.setAuthor({ name: message.guild.name, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
    .setTitle(`${emojis.all ?? '📋'}  All Commands`)
    .setDescription(sections || 'No commands found.')
    .setTimestamp();
}

module.exports = {
  name: 'help',
  category: 'General',
  aliases: ['helpp', 'h'],
  cooldown: 5,
  description: 'Browse all bot commands by category.',
  args: false,
  botPrams: [],
  owner: false,

  execute: async (message, args, client, prefix) => {
    // ── 1. Group commands by category, excluding hidden ones ──────────────────
    const grouped = {};
    for (const cmd of client.commands.values()) {
      const cat = cmd.category ?? 'Uncategorized';
      if (HIDDEN_CATEGORIES.includes(cat)) continue;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(cmd);
    }

    // ── 2. Build all embeds up front ──────────────────────────────────────────
    const homeEmbed        = buildHomeEmbed(client, message, prefix, grouped);
    const allCommandsEmbed = buildAllCommandsEmbed(client, message, grouped);
    const categoryEmbeds   = {};
    for (const [cat, cmds] of Object.entries(grouped)) {
      categoryEmbeds[cat] = buildCategoryEmbed(cat, cmds, client, message);
    }

    // ── 3. Build select menu options dynamically ──────────────────────────────
    const selectOptions = [
      {
        label: 'Home',
        description: 'Return to the main help page',
        value: '__home__',
        emoji: getCategoryEmoji('general'),
      },
      ...Object.keys(grouped).map(cat => ({
        label: cat,
        description: `View ${cat} commands`,
        value: cat,
        emoji: getCategoryEmoji(cat),
      })),
      {
        label: 'All Commands',
        description: 'Show All commands at once',
        value: '__all__',
        emoji: emojis.all ?? '📋',
      },
    ];

    const selectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('help_category')
        .setPlaceholder('❯ SELECT A CATEGORY')
        .addOptions(selectOptions)
    );

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Invite BOT')
        .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&integration_type=0&scope=bot+applications.commands`)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Support HQ')
        .setURL('https://discord.com/invite/w77ymEU82a')
        .setStyle(ButtonStyle.Link)
    );

    // ── 4. Send the initial message ───────────────────────────────────────────
    const msg = await message.channel.send({
      embeds: [homeEmbed],
      components: [selectRow],
    });

    // ── 5. Collect interactions ───────────────────────────────────────────────
    const collector = msg.createMessageComponentCollector({
      filter: (interaction) => {
        if (interaction.user.id === message.author.id) return true;
        interaction.reply({
          content: `<:x_cross:1475040602654642176> Only <@${message.author.id}> can use this menu.`,
          ephemeral: true,
        });
        return false;
      },
      time: COLLECTOR_TIMEOUT,
    });

    collector.on('collect', async (interaction) => {
      if (!interaction.isStringSelectMenu()) return;

      const [value] = interaction.values;
      let embed;

      if (value === '__home__') {
        embed = homeEmbed;
      } else if (value === '__all__') {
        embed = allCommandsEmbed;
      } else {
        embed = categoryEmbeds[value];
        if (!embed) {
          return interaction.reply({
            content: `❓ Unknown category: **${value}**`,
            ephemeral: true,
          });
        }
      }

      await interaction.update({ embeds: [embed], components: [selectRow] });
    });

    collector.on('end', () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  },
};