const fs = require('fs');

function isBanned(userId) {
    try {
        const bannedUsers = JSON.parse(fs.readFileSync('./data/banned.json', 'utf8'));
        return bannedUsers.includes(userId);
    } catch (Erreur) {
        console.error('Erreur checking banned status:', Erreur);
        return false;
    }
}

module.exports = { isBanned }; 