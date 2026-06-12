const { ActivityType, AttachmentBuilder } = require("discord.js");
const NoPrefixes = require('../../models/noprefix');
const cron = require('node-cron'); // Added
const fs = require('fs'); // Added
const { createBirthdayCard } = require('../../utils/birthdayCard'); // Added

global.isReady = false;

module.exports = {
    name: "ready",
    run: async (client) => {
        client.logger.log(`${client.user.username} online!`, "ready");
        client.logger.log(`Ready on ${client.guilds.cache.size} servers, for a total of ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`, "ready");
        
        // BIRTHDAY AUTOMATION — runs once daily at midnight
        const wishedToday = new Set(); // tracks userId-date pairs to prevent duplicates

        cron.schedule('0 0 * * *', async () => {
            let raw = '{}';
            try { raw = fs.readFileSync('./src/base/birthdays.json', 'utf8'); } catch (_) {}
            const data = raw.trim() ? JSON.parse(raw) : {};

            const today = new Date();
            const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;

            for (const [userId, info] of Object.entries(data)) {
                if (info.dob !== dateStr) continue;

                const wishKey = `${userId}-${dateStr}`;
                if (wishedToday.has(wishKey)) continue; // already wished today

                // Search every guild the bot is in for this member
                let member = null;
                for (const guild of client.guilds.cache.values()) {
                    try {
                        member = await guild.members.fetch(userId);
                        break; // found — stop searching
                    } catch (_) {
                        // user not in this guild, try the next one
                    }
                }

                if (!member) {
                    console.log(`Birthday: could not find user ${userId} in any guild — skipping.`);
                    continue;
                }

                const channel = client.channels.cache.get('1479760789454717099');
                if (!channel) {
                    console.log(`Birthday: announcement channel not found — check the channel ID in ready.js.`);
                    continue;
                }

                try {
                    const cardBuffer = await createBirthdayCard(member);
                    const attachment = new AttachmentBuilder(cardBuffer, { name: 'birthday.png' });
                    await channel.send({
                        content: `🎉 Happy Birthday <@${userId}>!`,
                        files: [attachment]
                    });
                    wishedToday.add(wishKey); // mark as done for today
                } catch (err) {
                    console.error(`Birthday card error for ${userId}:`, err);
                }
            }
        });

        // ... [Keep your existing status interval, booster logic, and setTimeout here] ...
        
        let statuses = [`${client.prefix}help`, `${client.prefix}play`];
        setInterval(() => {
            let status = statuses[Math.floor(Math.random() * statuses.length)];
            client.user.setPresence({
                activities: [{ name: status, type: ActivityType.Listening }],
                status: "dnd"
            });
        }, 5000);
        
        const supportGuild = client.guilds.cache.get("1221909487472869619");
        if (supportGuild) {
            const role = supportGuild.roles.premiumSubscriberRole;
            if (role) {
                await supportGuild.members.fetch();
                const boosters = supportGuild.members.cache.filter(m => m.roles.cache.has(role.id));
                for (const booster of boosters.values()) {
                    const existing = await NoPrefixes.findOne({ where: { userId: booster.id } });
                    if (!existing) {
                        await NoPrefixes.create({ userId: booster.id });
                        await client.channels.cache.get("1364788828514287646")?.send(`✅ Auto NoPrefix Added to \`${booster.user.tag}\``);
                    }
                }
            }
        }
        
        setTimeout(() => {
            global.isReady = true;
            console.log('Bot is now ready to track guild leave events');
        }, 10000);
    }
};
