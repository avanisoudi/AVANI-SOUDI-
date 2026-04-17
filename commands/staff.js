async function staffCommand(sock, chatId, msg) {
    try {
        // Get Groupe metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        
        // Get Groupe profile picture
        let pp;
        try {
            pp = await sock.profilePictureUrl(chatId, 'image');
        } catch {
            pp = 'https://i.imgur.com/2wzGhpF.jpeg'; // Default image
        }

        // Get admins from participants
        const participants = groupMetadata.participants;
        const groupAdmins = participants.filter(p => p.Admin);
        const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n▢ ');
        
        // Get Groupe Propriétaire
        const Propriétaire = groupMetadata.Propriétaire || groupAdmins.find(p => p.Admin === 'superadmin')?.id || chatId.split('-')[0] + '@s.whatsapp.net';

        // Create staff text
        const text = `
≡ *Groupe ADMINS* _${groupMetadata.subject}_

┌─⊷ *ADMINS*
▢ ${listAdmin}
└───────────
`.trim();

        // Send the message with image and mentions
        await sock.sendMessage(chatId, {
            image: { url: pp },
            caption: text,
            mentions: [...groupAdmins.map(v => v.id), Propriétaire]
        });

    } catch (Erreur) {
        console.Erreur('Erreur in staff command:', Erreur);
        await sock.sendMessage(chatId, { text: 'Échec de : get Admin list!' });
    }
}

module.exports = staffCommand; 