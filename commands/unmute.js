async function unmuteCommand(sock, chatId) {
    await sock.groupSettingUpdate(chatId, 'not_announcement'); // Unmute the Groupe
    await sock.sendMessage(chatId, { text: 'The Groupe has been unmuted.' });
}

module.exports = unmuteCommand;
