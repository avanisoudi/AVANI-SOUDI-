const settings = require("../settings");
async function aliveCommand(sock, chatId, message) {
    try {
        const message1 = `*🤖 Knight Bot est Actif !*\n\n` +
                       `*Version:* ${settings.version}\n` +
                       `*status:* En ligne\n` +
                       `*Mode:* Public\n\n` +
                       `*🌟 Fonctionnalités :*\n` +
                       `• Gestion de Groupe\n` +
                       `• Protection Antilien\n` +
                       `• Commandes Fun\n` +
                       `• Et plus encore !\n\n` +
                       `Tapez *.menu* pour la liste complète des commandes.`;

        await sock.sendMessage(chatId, {
            text: message1,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363161513685998@newsletter',
                    newsletterName: 'Knight Bot',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    } catch (error) {
        console.error('Erreur dans la commande alive:', error);
        await sock.sendMessage(chatId, { text: 'Le bot est actif et en cours d\'exécution !' }, { quoted: message });
    }
}

module.exports = aliveCommand;
