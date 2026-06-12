const { ActivityType } = require("discord.js");
const NoPrefixes = require('../../models/noprefix');
const cron = require('node-cron');
const { runBirthdayCheck } = require('../../utils/runBirthdayCheck');

global.isReady = false;

module.exports = {
    name: "ready",
    run: async (client) => {
        client.logger.log(`${client.user.username} online!`, "ready");
        client.logger.log(`Ready on ${client.guilds.cache.size} servers, for a total of ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`, "ready");
        
        // BIRTHDAY AUTOMATION — runs once daily at midnight
        const wishedToday = new Set();

        cron.schedule('0 0 * * *', async () => {
            const { wished, skipped } = await runBirthdayCheck(client, { wishedToday });
            if (wished.length)  console.log(`Birthday: wished ${wished.length} user(s).`);
            if (skipped.length) console.log(`Birthday: skipped ${skipped.length} user(s).`);
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
        
        const supportGuild = client.guilds.cache.get("1281317452881465434");
        if (supportGuild) {
            const role = supportGuild.roles.premiumSubscriberRole;
            if (role) {
                await supportGuild.members.fetch();
                const boosters = supportGuild.members.cache.filter(m => m.roles.cache.has(role.id));
                for (const booster of boosters.values()) {
                    const existing = await NoPrefixes.findOne({ where: { userId: booster.id } });
                    if (!existing) {
                        await NoPrefixes.create({ userId: booster.id });
                        await client.channels.cache.get("1479760785206153287")?.send(`✅ Auto NoPrefix Added to \`${booster.user.tag}\``);
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
