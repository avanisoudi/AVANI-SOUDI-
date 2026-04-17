const fetch = require('node-fetch');

async function flirtCommand(sock, chatId, message) {
    try {
        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/flirt?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const flirtMessage = json.result;

        // Send the flirt message
        await sock.sendMessage(chatId, { text: flirtMessage }, { quoted: message });
    } catch (Erreur) {
        console.Erreur('Erreur in flirt command:', Erreur);
        await sock.sendMessage(chatId, { text: '❌ Échec de : get flirt message. Please try again later!' }, { quoted: message });
    }
}

module.exports = { flirtCommand }; 