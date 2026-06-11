const { EmbedBuilder } = require("discord.js");
const { getAIResponse } = require("../../services/aiService"); 

module.exports = {
  name: 'recap',
  category: 'General',
  aliases: ['summary'],
  cooldown: 30, 
  description: 'Summarizes the last 50 messages in the current channel',
  args: false,
  usage: '[messageCount]',
  userPrams: ['ManageMessages'], 
  botPrams: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    // 1. Determine message count (default to 50, cap at 100)
    const count = parseInt(args[0]) || 50;
    const fetchCount = Math.min(count, 100); 

    const statusMsg = await message.reply(`🔍 Analyzing the last ${fetchCount} messages...`);
    
    // 2. Fetch and filter messages
    const messages = await message.channel.messages.fetch({ limit: fetchCount });
    const formattedMessages = messages
      .filter(m => !m.author.bot) // Exclude bots
      .map(m => `${m.author.username}: ${m.content}`)
      .reverse()
      .join('\n');

    // 3. Get AI Summary
    try {
      const summary = await getAIResponse(
        `Summarize this Discord conversation into 3 key topics, identify major decisions, and list the top 2 contributors:\n\n${formattedMessages}`,
        []
      );

      // 4. Create the Embed
      const recapEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`📜 Recap: #${message.channel.name}`)
        .setDescription(summary)
        .setFooter({ text: `Requested by ${message.author.tag}` })
        .setTimestamp();

      // 5. Final Output
      await statusMsg.edit({ content: null, embeds: [recapEmbed] });
      
    } catch (error) {
      console.error("AI Recap Error:", error);
      await statusMsg.edit({ content: "❌ Sorry, I encountered an error while trying to think. Please try again later." });
    }
  }
}
