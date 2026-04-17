const fetch = require('node-fetch');

async function dareCommand(sock, chatId, message) {
    try {
        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/dare?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const dareMessage = json.result;

        // Send the dare message
        await sock.sendMessage(chatId, { text: dareMessage }, { quoted: message });
    } catch (Erreur) {
        console.Erreur('Erreur in dare command:', Erreur);
        await sock.sendMessage(chatId, { text: '❌ Échec de : get dare. Please try again later!' }, { quoted: message });
    }
}

module.exports = { dareCommand };
