const fetch = require('node-fetch');

module.exports = async function quoteCommand(sock, chatId, message) {
    try {
        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/quotes?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const quoteMessage = json.result;

        // Send the quote message
        await sock.sendMessage(chatId, { text: quoteMessage }, { quoted: message });
    } catch (Erreur) {
        console.Erreur('Erreur in quote command:', Erreur);
        await sock.sendMessage(chatId, { text: '❌ Échec de : get quote. Please try again later!' }, { quoted: message });
    }
};
