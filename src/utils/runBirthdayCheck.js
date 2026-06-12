const fs = require('fs');
const { AttachmentBuilder } = require('discord.js');
const { createBirthdayCard } = require('./birthdayCard');

const BIRTHDAY_CHANNEL_ID = '1479760789454717099';

/**
 * Runs the birthday check for a given date.
 *
 * @param {import('../structures/MusicClient')} client
 * @param {object}  options
 * @param {string}  [options.dateStr]        - Date to check in DD/MM format. Defaults to today.
 * @param {object}  [options.channelOverride] - Send results here instead of the configured channel.
 * @param {Set}     [options.wishedToday]    - Shared Set to prevent duplicate wishes.
 * @returns {{ wished: string[], skipped: string[] }}
 */
async function runBirthdayCheck(client, { dateStr = null, channelOverride = null, wishedToday = null } = {}) {
    const wished  = [];
    const skipped = [];

    // ── Load birthdays ────────────────────────────────────────────────────────
    let raw = '{}';
    try { raw = fs.readFileSync('./src/base/birthdays.json', 'utf8'); } catch (_) {}
    const data = raw.trim() ? JSON.parse(raw) : {};

    if (Object.keys(data).length === 0) return { wished, skipped };

    // ── Resolve date ──────────────────────────────────────────────────────────
    if (!dateStr) {
        const today = new Date();
        dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;
    }

    // ── Resolve announcement channel ──────────────────────────────────────────
    const channel = channelOverride ?? client.channels.cache.get(BIRTHDAY_CHANNEL_ID);
    if (!channel) {
        console.log(`Birthday: announcement channel not found (ID: ${BIRTHDAY_CHANNEL_ID}). Update BIRTHDAY_CHANNEL_ID in src/utils/runBirthdayCheck.js`);
        return { wished, skipped };
    }

    // ── Check each stored birthday ────────────────────────────────────────────
    for (const [userId, info] of Object.entries(data)) {
        if (info.dob !== dateStr) continue;

        // Duplicate guard (only applies when wishedToday Set is passed in)
        const wishKey = `${userId}-${dateStr}`;
        if (wishedToday?.has(wishKey)) {
            skipped.push(userId);
            continue;
        }

        // Find this user in any guild the bot is in
        let member = null;
        for (const guild of client.guilds.cache.values()) {
            try {
                member = await guild.members.fetch(userId);
                break;
            } catch (_) {}
        }

        if (!member) {
            console.log(`Birthday: user ${userId} not found in any guild — skipping.`);
            skipped.push(userId);
            continue;
        }

        try {
            const cardBuffer = await createBirthdayCard(member);
            const attachment = new AttachmentBuilder(cardBuffer, { name: 'birthday.png' });
            await channel.send({
                content: `🎉 Happy Birthday <@${userId}>!`,
                files: [attachment],
            });
            wishedToday?.add(wishKey);
            wished.push(userId);
        } catch (err) {
            console.error(`Birthday card error for ${userId}:`, err);
            skipped.push(userId);
        }
    }

    return { wished, skipped };
}

module.exports = { runBirthdayCheck, BIRTHDAY_CHANNEL_ID };
