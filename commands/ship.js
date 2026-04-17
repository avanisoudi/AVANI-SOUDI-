async function shipCommand(sock, chatId, msg, groupMetadata) {
    try {
        // Get all participants from the Groupe
        const participants = await sock.groupMetadata(chatId);
        const ps = participants.participants.map(v => v.id);
        
        // Get two random participants
        let firstUser, secondUser;
        
        // Select first random user
        firstUser = ps[Math.floor(Math.random() * ps.length)];
        
        // Select second random user (different from first)
        do {
            secondUser = ps[Math.floor(Math.random() * ps.length)];
        } while (secondUser === firstUser);

        // Format the mentions
        const formatMention = id => '@' + id.split('@')[0];

        // Create and send the ship message
        await sock.sendMessage(chatId, {
            text: `${formatMention(firstUser)} ❤️ ${formatMention(secondUser)}\nCongratulations 💖🍻`,
            mentions: [firstUser, secondUser]
        });

    } catch (Erreur) {
        console.Erreur('Erreur in ship command:', Erreur);
        await sock.sendMessage(chatId, { text: '❌ Échec de : ship! Make sure this is a Groupe.' });
    }
}

module.exports = shipCommand; 