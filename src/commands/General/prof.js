const { EmbedBuilder } = require("discord.js");
const User = require('../../schema/User');

module.exports = {
  name: 'prof',
  category: 'General',
  aliases: ['pfo', 'pro'],
  cooldown: 5,
  description: 'View your profile or someone else\'s profile',
  usage: '[user mention or ID]',
  execute: async (message, args, client, prefix) => {
    await message.channel.sendTyping();

    // 1. Resolve Target User
    let targetUser = message.member;
    if (args[0]) {
      targetUser = message.mentions.members.first() || (await message.guild.members.fetch(args[0]).catch(() => null));
      if (!targetUser) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ | Could not find that user!')] });
    }

    // 2. Badge Mapping Configuration
    const badgeMap = {
      "1481569633759924306": "<:Dev:1475040497666887770> **Developer**",
      "1481569633759924306": "<:owner:1475040564461178910> **Owner**",
      "1481569633759924306": "<:Admin:1475040480256327742> **Admin**",
      "1481569633759924306": "<:Manager:1475040518869094420> **Community Manager**",
      "1481569633759924306": "<a:premium:1295495411330584778> **Premium User**",
      "1481569633759924306": "<:moderator:1475040525844217880> **Moderator**",
      "1481569633759924306": "<:SupportTeam:1475040587492360233> **Support Team**",
      "1481569633759924306": "<:BugHunter_icone:1475040487843823732> **Bug Hunter**",
      "1481569633759924306": "<:VIP:1475040599286743073> **VIP**",
      "1481569633759924306": "<:partnership:1475040569817432212> **Partners**",
      "1481569633759924306": "<:friend:1475040512439484507> **Owner's Friend**",
      "1481569633759924306": "<:supporters:1475040585172914197> **Supporter**",
      "1481569633759924306": "<:users:1475040593930358858> **Bot User**"
    };

    // 3. Build Badges Dynamically
    let badges = "";
    for (const [roleId, badgeString] of Object.entries(badgeMap)) {
      if (targetUser.roles.cache.has(roleId)) badges += `\n${badgeString}`;
    }

    // 4. Fetch User Data
    let u = await User.findById(targetUser.id);
    if (!u) u = await User.create({ _id: targetUser.id });
    const bio = u.bio || `No bio set. Use \`${prefix}bio <bio>\` to set your bio.`;

    // 5. Final Embed
    const embed = new EmbedBuilder()
      .setAuthor({ name: targetUser.user.username, iconURL: targetUser.user.displayAvatarURL({ dynamic: true })})
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .addFields([
        { name: `**__Bio__**`, value: bio },
        { name: `**__Server Badges__**`, value: badges || `<:x_cross:1475040602654642176> Oops! No badges found. Join our [Support Server](https://discord.gg/utshorgo)` }
      ])
      .setColor(client.ankushcolor)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
