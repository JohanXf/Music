const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: 'snipe',
  category: 'social',
  aliases: ['s'],
  cooldown: 5,
  description: 'See the last deleted message in the channel.',
  args: false,
  usage: '',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    const msg = client.snipes.get(message.channel.id);
    if (!msg) return message.reply("There is nothing to snipe!");

    const embed = new EmbedBuilder()
      .setAuthor({ name: msg.author.tag, iconURL: msg.author.displayAvatarURL() })
      .setDescription(msg.content || "No text content.")
      .setColor('21232B') // Caramel/Beige theme
      .setFooter({ text: `Deleted at ${new Date(msg.date).toLocaleTimeString()}` });

    if (msg.image) embed.setImage(msg.image);

    message.reply({ embeds: [embed] });
  }
}
