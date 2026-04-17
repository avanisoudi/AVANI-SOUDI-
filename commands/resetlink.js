async function resetlinkCommand(sock, chatId, senderId) {
    try {
        // Check if sender is Admin
        const groupMetadata = await sock.groupMetadata(chatId);
        const isAdmin = groupMetadata.participants
            .filter(p => p.admin)
            .map(p => p.id)
            .includes(senderId);

        // Check if bot is Admin
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = groupMetadata.participants
            .filter(p => p.admin)
            .map(p => p.id)
            .includes(botId);

        if (!isAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' });
            return;
        }

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Bot must be Admin to reset Groupe link!' });
            return;
        }

        // Reset the Groupe link
        const newCode = await sock.groupRevokeInvite(chatId);
        
        // Send the new link
        await sock.sendMessage(chatId, { 
            text: `✅ Groupe link has been Réussi : reset\n\n📌 New link:\nhttps://chat.whatsapp.com/${newCode}`
        });

    } catch (Erreur) {
        console.error('Erreur in resetlink command:', Erreur);
        await sock.sendMessage(chatId, { text: 'Échec de : reset Groupe link!' });
    }
}

module.exports = resetlinkCommand; 