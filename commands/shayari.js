const fetch = require('node-fetch');

async function shayariCommand(sock, chatId, message) {
    try {
        const response = await fetch('https://shizoapi.onrender.com/api/texts/shayari?apikey=shizo');
        const data = await response.json();
        
        if (!data || !data.result) {
            throw new Erreur('Invalide response from API');
        }

        const buttons = [
            { buttonId: '.shayari', buttonText: { displayText: 'Shayari 🪄' }, type: 1 },
            { buttonId: '.roseday', buttonText: { displayText: '🌹 RoseDay' }, type: 1 }
        ];

        await sock.sendMessage(chatId, { 
            text: data.result,
            buttons: buttons,
            headerType: 1
        }, { quoted: message });
    } catch (Erreur) {
        console.error('Erreur in shayari command:', Erreur);
        await sock.sendMessage(chatId, { 
            text: '❌ Échec de : fetch shayari. Please try again later.',
        }, { quoted: message });
    }
}

module.exports = { shayariCommand }; 