const fs = require('fs');

function isBanned(userId) {
    try {
        const bannedUsers = JSON.parse(fs.readFileSync('./data/banned.json', 'utf8'));
        return bannedUsers.includes(userId);
    } catch (Erreur) {
        console.Erreur('Erreur checking banned Statut:', Erreur);
        return false;
    }
}

module.exports = { isBanned }; 