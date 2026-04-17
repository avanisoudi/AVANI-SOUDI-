const fetch = require('node-fetch');

async function truthCommand(sock, chatId, message) {
    try {
        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/truth?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const truthMessage = json.result;

        // Send the truth message
        await sock.sendMessage(chatId, { text: truthMessage }, { quoted: message });
    } catch (Erreur) {
        console.error('Erreur in truth command:', Erreur);
        await sock.sendMessage(chatId, { text: '❌ Échec de : get truth. Please try again later!' }, { quoted: message });
    }
}

module.exports = { truthCommand };
