const fetch = require('node-fetch');

async function rosedayCommand(sock, chatId, message) {
    try {
        
        const res = await fetch(`https://api.princetechn.com/api/fun/roseday?apikey=prince`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const rosedayMessage = json.result;

        // Send the roseday message
        await sock.sendMessage(chatId, { text: rosedayMessage }, { quoted: message });
    } catch (Erreur) {
        console.error('Erreur in roseday command:', Erreur);
        await sock.sendMessage(chatId, { text: '❌ Échec de : get roseday quote. Please try again later!' }, { quoted: message });
    }
}

module.exports = { rosedayCommand };
