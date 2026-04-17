const fs = require('fs');
const path = require('path');
const { channelInfo } = require('../lib/messageConfig');
const isAdmin = require('../lib/isAdmin');
const { isSudo } = require('../lib/index');

async function unbanCommand(sock, chatId, message) {
    // Restrict in groups to admins; in Privé to Propriétaire/sudo
    const isGroup = chatId.endsWith('@g.us');
    if (isGroup) {
        const senderId = message.key.participant || message.key.remoteJid;
        const { isSenderadmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: 'Veuillez nommer le bot administrateur pour utiliser .unban', ...channelInfo }, { quoted: message });
            return;
        }
        if (!isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { text: 'Seuls les administrateurs du groupe peuvent utiliser .unban', ...channelInfo }, { quoted: message });
            return;
        }
    } else {
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        if (!message.key.fromMe && !senderIsSudo) {
            await sock.sendMessage(chatId, { text: 'Seul le propriétaire/sudo peut utiliser .unban in Privé chat', ...channelInfo }, { quoted: message });
            return;
        }
    }
    let userToUnban;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToUnban = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToUnban = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToUnban) {
        await sock.sendMessage(chatId, { 
            text: 'Veuillez mentionner l'utilisateur or reply to their message to unban!', 
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    try {
        const bannedUsers = JSON.parse(fs.readFileSync('./data/banned.json'));
        const index = bannedUsers.indexOf(userToUnban);
        if (index > -1) {
            bannedUsers.splice(index, 1);
            fs.writeFileSync('./data/banned.json', JSON.stringify(bannedUsers, null, 2));
            
            await sock.sendMessage(chatId, { 
                text: `Réussi : unbanned ${userToUnban.split('@')[0]}!`,
                mentions: [userToUnban],
                ...channelInfo 
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: `${userToUnban.split('@')[0]} is not banned!`,
                mentions: [userToUnban],
                ...channelInfo 
            });
        }
    } catch (Erreur) {
        console.error('Erreur in unban command:', Erreur);
        await sock.sendMessage(chatId, { text: 'Échec de : unban user!', ...channelInfo }, { quoted: message });
    }
}

module.exports = unbanCommand; 