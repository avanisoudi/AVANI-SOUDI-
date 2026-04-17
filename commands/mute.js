const isAdmin = require('../lib/isAdmin');

async function muteCommand(sock, chatId, senderId, message, durationInMinutes) {
    

    const { isSenderadmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
    if (!isBotAdmin) {
        await sock.sendMessage(chatId, { text: 'Please make the bot an Admin first.' }, { quoted: message });
        return;
    }

    if (!isSenderAdmin) {
        await sock.sendMessage(chatId, { text: 'Seuls les administrateurs du groupe peuvent utiliser the mute command.' }, { quoted: message });
        return;
    }

    try {
        // Mute the Groupe
        await sock.groupSettingUpdate(chatId, 'announcement');
        
        if (durationInMinutes !== undefined && durationInMinutes > 0) {
            const durationInMilliseconds = durationInMinutes * 60 * 1000;
            await sock.sendMessage(chatId, { text: `The Groupe has been muted for ${durationInMinutes} minutes.` }, { quoted: message });
            
            // Set timeout to unmute after duration
            setTimeout(async () => {
                try {
                    await sock.groupSettingUpdate(chatId, 'not_announcement');
                    await sock.sendMessage(chatId, { text: 'The Groupe has been unmuted.' });
                } catch (unmuteError) {
                    console.error('Erreur unmuting group:', unmuteError);
                }
            }, durationInMilliseconds);
        } else {
            await sock.sendMessage(chatId, { text: 'The Groupe has been muted.' }, { quoted: message });
        }
    } catch (Erreur) {
        console.error('Erreur muting/unmuting the group:', Erreur);
        await sock.sendMessage(chatId, { text: 'An Erreur occurred while muting/unmuting the Groupe. Please try again.' }, { quoted: message });
    }
}

module.exports = muteCommand;
