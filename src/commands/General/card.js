const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    name: 'card',
    category: 'General',
    description: 'Generates a premium, full-screen profile card.',
    execute: async (message, args, client) => {
        // Usage: !!profile [twitter_handle] [github_handle]
        const twitter = args[0] || 'None';
        const github = args[1] || 'None';

        // 1. Setup Canvas (using the quote.js standard)
        const canvas = createCanvas(900, 450);
        const ctx = canvas.getContext('2d');

        // Draw rounded background
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.roundRect(0, 0, 900, 450, 30);
        ctx.fill();
        ctx.clip(); // Keeps content inside rounded edges

        // 2. Load & Draw Avatar with Gradient Fade (Full Left Side)
        const avatar = await loadImage(message.author.displayAvatarURL({ extension: 'png', size: 1024 }));
        ctx.drawImage(avatar, 0, 0, 450, 450);

        const gradient = ctx.createLinearGradient(200, 0, 450, 0);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 450, 450);

        // 3. Draw Text Hierarchy (Right Side)
        ctx.fillStyle = '#ffffff';
        
        // Name (Server display name)
        ctx.font = 'bold 45px sans-serif';
        const displayName = message.member?.displayName ?? message.author.username;
        ctx.fillText(displayName, 480, 150);

        // Subtitle/Roles (example text - can be made dynamic)
        ctx.font = 'italic 20px sans-serif';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText('Server Member', 480, 185);

        // Social Section
        ctx.fillStyle = '#666666'; // Dimmer color for section header
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('SOCIAL HANDLES', 480, 260);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '25px sans-serif';
        ctx.fillText(`Twitter: ${twitter}`, 480, 300);
        ctx.fillText(`GitHub: ${github}`, 480, 340);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'profile.png' });
        await message.channel.send({ files: [attachment] });
    }
};
