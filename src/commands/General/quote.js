const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    name: 'quote',
    category: 'General',
    description: 'Turns a replied message into a quote image.',
    execute: async (message, args, client) => {
        // 1. Check if the user is replying to a message
        if (!message.reference) {
            return message.reply("❌ Please reply to a message you want to quote!");
        }

        const repliedMsg = await message.channel.messages.fetch(message.reference.messageId);
        if (!repliedMsg.content) return message.reply("❌ That message has no text to quote.");

        // 2. Setup Canvas
        const canvas = createCanvas(800, 400);
        const ctx = canvas.getContext('2d');

        // Draw dark background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3. Load and Draw Avatar (on the left)
        const avatar = await loadImage(repliedMsg.author.displayAvatarURL({ extension: 'png', size: 512 }));
        ctx.drawImage(avatar, 20, 50, 300, 300);

        // 4. Draw Text (Quote)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px Arial';
        
        // Simple text wrap
        const text = repliedMsg.content;
        const words = text.split(' ');
        let line = '';
        let y = 100;
        
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            if (ctx.measureText(testLine).width > 400) {
                ctx.fillText(line, 350, y);
                line = words[n] + ' ';
                y += 40;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 350, y);

        // Draw Author Name
        ctx.font = 'italic 20px Arial';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(`- ${repliedMsg.author.username}`, 350, y + 60);

        // 5. Send Image
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'quote.png' });
        await message.channel.send({ files: [attachment] });
    }
};
