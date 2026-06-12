const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    name: 'quote',
    category: 'General',
    description: 'Generates a premium quote image.',
    execute: async (message, args, client) => {
        if (!message.reference) return message.reply("❌ Please reply to a message!");
        const repliedMsg = await message.channel.messages.fetch(message.reference.messageId);

        // 1. Setup Canvas
        const canvas = createCanvas(900, 450);
        const ctx = canvas.getContext('2d');

        // Draw rounded container
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.roundRect(0, 0, 900, 450, 30);
        ctx.fill();
        ctx.clip();

        // 2. Load & Draw Avatar with Gradient Fade
        const avatar = await loadImage(repliedMsg.author.displayAvatarURL({ extension: 'png', size: 1024 }));
        ctx.drawImage(avatar, 0, 0, 450, 450);

        const gradient = ctx.createLinearGradient(200, 0, 450, 0);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 450, 450);

        // 3. Draw Text
        ctx.fillStyle = '#ffffff';
        
        // Wrap text with quotes
        ctx.font = 'bold 35px sans-serif';
        const formattedQuote = `“${repliedMsg.content}”`;
        const lines = wrapText(ctx, formattedQuote, 400);
        
        // Draw lines
        lines.forEach((line, i) => ctx.fillText(line, 480, 150 + (i * 45)));

        // Attribution
        const lastY = 150 + (lines.length * 45);
        ctx.font = 'italic 20px sans-serif';
        ctx.fillStyle = '#aaaaaa';
        
        // Use server display name
        const nameToDisplay = repliedMsg.member?.displayName ?? repliedMsg.author.username;
        ctx.fillText(`— ${nameToDisplay}`, 480, lastY + 20);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'quote.png' });
        await message.channel.send({ files: [attachment] });
    }
};

// Helper function for clean text wrapping
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const width = ctx.measureText(currentLine + " " + words[i]).width;
        if (width < maxWidth) {
            currentLine += " " + words[i];
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);
    return lines;
}
