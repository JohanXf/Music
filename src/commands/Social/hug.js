const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: 'hug',
  category: 'Social',
  aliases: ['cuddle'],
  cooldown: 3,
  description: 'Give someone a warm hug.',
  args: true,
  usage: '@user',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    const target = message.mentions.users.first();
    if (!target) return message.reply("Please mention someone you want to hug!");

    const hugs = [
      "https://media.tenor.com/2s4-164t83kAAAAC/anime-hug.gif",
      "https://media.tenor.com/vHq1XWJ63xIAAAAi/hug-cats.gif",
      "https://media.tenor.com/o24r9_l7c6QAAAAM/panda-hug.gif"
    ];

    const randomHug = hugs[Math.floor(Math.random() * hugs.length)];

    const embed = new EmbedBuilder()
      .setTitle('🤗 A Warm Hug!')
      .setDescription(`${message.author} gave ${target} a big hug!`)
      .setImage(randomHug)
      .setColor('21232B') // Caramel/Beige Theme
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
}
