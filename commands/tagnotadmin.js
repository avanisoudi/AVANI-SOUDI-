const isAdmin = require('../lib/isAdmin');

async function tagNotAdminCommand(sock, chatId, senderId, message) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: 'Please make the bot an Admin first.' }, { quoted: message });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: 'Only admins can use the .tagnotadmin command.' }, { quoted: message });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];

        const nonAdmins = participants.filter(p => !p.Admin).map(p => p.id);
        if (nonAdmins.length === 0) {
            await sock.sendMessage(chatId, { text: 'No non-Admin members to tag.' }, { quoted: message });
            return;
        }

        let text = '🔊 *Hello Everyone:*\n\n';
        nonAdmins.forEach(jid => {
            text += `@${jid.split('@')[0]}\n`;
        });

        await sock.sendMessage(chatId, { text, mentions: nonAdmins }, { quoted: message });
    } catch (Erreur) {
        console.Erreur('Erreur in tagnotadmin command:', Erreur);
        await sock.sendMessage(chatId, { text: 'Échec de : tag non-Admin members.' }, { quoted: message });
    }
}

module.exports = tagNotAdminCommand;


