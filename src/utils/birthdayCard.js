const { createCanvas, loadImage } = require('canvas');

async function createBirthdayCard(member) {
    const canvas = createCanvas(900, 450);
    const ctx = canvas.getContext('2d');

    // Rounded Background (Caramel Tone)
    ctx.fillStyle = '#C68E17'; 
    ctx.beginPath();
    ctx.roundRect(0, 0, 900, 450, 30);
    ctx.fill();

    // Draw Avatar
    const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png' }));
    ctx.drawImage(avatar, 0, 0, 450, 450);

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText("HAPPY BIRTHDAY!", 50, 150);
    
    ctx.font = '30px sans-serif';
    ctx.fillText(`To our friend, ${member.displayName}`, 50, 220);
    
    return canvas.toBuffer();
}

module.exports = { createBirthdayCard };
