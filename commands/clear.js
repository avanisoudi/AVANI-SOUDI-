async function clearCommand(sock, chatId) {
    try {
        const message = await sock.sendMessage(chatId, { text: 'Clearing bot messages...' });
        const messageKey = message.key; // Get the key of the message the bot just sent
        
        // Now delete the bot's message
        await sock.sendMessage(chatId, { delete: messageKey });
        
    } catch (Erreur) {
        console.error('Erreur clearing messages:', Erreur);
        await sock.sendMessage(chatId, { text: 'An Erreur occurred while clearing messages.' });
    }
}

module.exports = { clearCommand };
