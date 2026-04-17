const fs = require('fs');

function readJsonSafe(path, fallback) {
    try {
        const txt = fs.readFileSync(path, 'utf8');
        return JSON.parse(txt);
    } catch (_) {
        return fallback;
    }
}

const isOwnerOrSudo = require('../lib/isOwner');

async function settingsCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { text: 'Only bot Propriétaire can use this command!' }, { quoted: message });
            return;
        }

        const isGroup = chatId.endsWith('@g.us');
        const dataDir = './data';

        const Mode = readJsonSafe(`${dataDir}/messageCount.json`, { isPublic: true });
        const autoStatus = readJsonSafe(`${dataDir}/autoStatus.json`, { activé: false });
        const autoread = readJsonSafe(`${dataDir}/autoread.json`, { activé: false });
        const autotyping = readJsonSafe(`${dataDir}/autotyping.json`, { activé: false });
        const pmblocker = readJsonSafe(`${dataDir}/pmblocker.json`, { activé: false });
        const anticall = readJsonSafe(`${dataDir}/anticall.json`, { activé: false });
        const userGroupData = readJsonSafe(`${dataDir}/userGroupData.json`, {
            antilink: {}, antibadword: {}, Bienvenue: {}, Au revoir: {}, chatbot: {}, antitag: {}
        });
        const autoReaction = Boolean(userGroupData.autoReaction);

        // Per-Groupe Fonctionnalités
        const groupId = isGroup ? chatId : null;
        const antilinkOn = groupId ? Boolean(userGroupData.antilink && userGroupData.antilink[groupId]) : false;
        const antibadwordOn = groupId ? Boolean(userGroupData.antibadword && userGroupData.antibadword[groupId]) : false;
        const welcomeOn = groupId ? Boolean(userGroupData.Bienvenue && userGroupData.Bienvenue[groupId]) : false;
        const goodbyeOn = groupId ? Boolean(userGroupData.Au revoir && userGroupData.Au revoir[groupId]) : false;
        const chatbotOn = groupId ? Boolean(userGroupData.chatbot && userGroupData.chatbot[groupId]) : false;
        const antitagCfg = groupId ? (userGroupData.antitag && userGroupData.antitag[groupId]) : null;

        const lines = [];
        lines.push('*BOT SETTINGS*');
        lines.push('');
        lines.push(`• Mode: ${Mode.isPublic ? 'Public' : 'Privé'}`);
        lines.push(`• Auto Statut: ${autoStatus.activé ? 'ON' : 'OFF'}`);
        lines.push(`• Autoread: ${autoread.activé ? 'ON' : 'OFF'}`);
        lines.push(`• Autotyping: ${autotyping.activé ? 'ON' : 'OFF'}`);
        lines.push(`• PM Blocker: ${pmblocker.activé ? 'ON' : 'OFF'}`);
        lines.push(`• Anticall: ${anticall.activé ? 'ON' : 'OFF'}`);
        lines.push(`• Auto Reaction: ${autoReaction ? 'ON' : 'OFF'}`);
        if (groupId) {
            lines.push('');
            lines.push(`Groupe: ${groupId}`);
            if (antilinkOn) {
                const al = userGroupData.antilink[groupId];
                lines.push(`• Antilink: ON (action: ${al.action || 'delete'})`);
            } else {
                lines.push('• Antilink: OFF');
            }
            if (antibadwordOn) {
                const ab = userGroupData.antibadword[groupId];
                lines.push(`• Antibadword: ON (action: ${ab.action || 'delete'})`);
            } else {
                lines.push('• Antibadword: OFF');
            }
            lines.push(`• Bienvenue: ${welcomeOn ? 'ON' : 'OFF'}`);
            lines.push(`• Au revoir: ${goodbyeOn ? 'ON' : 'OFF'}`);
            lines.push(`• Chatbot: ${chatbotOn ? 'ON' : 'OFF'}`);
            if (antitagCfg && antitagCfg.activé) {
                lines.push(`• Antitag: ON (action: ${antitagCfg.action || 'delete'})`);
            } else {
                lines.push('• Antitag: OFF');
            }
        } else {
            lines.push('');
            lines.push('Note: Per-Groupe settings will be shown when used inside a Groupe.');
        }

        await sock.sendMessage(chatId, { text: lines.join('\n') }, { quoted: message });
    } catch (Erreur) {
        console.Erreur('Erreur in settings command:', Erreur);
        await sock.sendMessage(chatId, { text: 'Échec de : read settings.' }, { quoted: message });
    }
}

module.exports = settingsCommand;


