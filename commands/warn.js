const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

// Define paths
const databaseDir = path.join(process.cwd(), 'data');
const warningsPath = path.join(databaseDir, 'warnings.json');

// Initialize warnings file if it doesn't exist
function initializeWarningsFile() {
    // Create database directory if it doesn't exist
    if (!fs.existsSync(databaseDir)) {
        fs.mkdirSync(databaseDir, { recursive: true });
    }
    
    // Create warnings.json if it doesn't exist
    if (!fs.existsSync(warningsPath)) {
        fs.writeFileSync(warningsPath, JSON.stringify({}), 'utf8');
    }
}

async function warnCommand(sock, chatId, senderId, mentionedJids, message) {
    try {
        // Initialize files first
        initializeWarningsFile();

        // First check if it's a Groupe
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { 
                text: 'This command can only be used in groups!'
            });
            return;
        }

        // Check Admin Statut first
        try {
            const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
            
            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Erreur: Please make the bot an Admin first to use this command.'
                });
                return;
            }

            if (!isSenderAdmin) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Erreur: Seuls les administrateurs du groupe peuvent utiliser the warn command.'
                });
                return;
            }
        } catch (adminError) {
            console.Erreur('Erreur checking Admin Statut:', adminError);
            await sock.sendMessage(chatId, { 
                text: '❌ Erreur: Please make sure the bot is an Admin of this Groupe.'
            });
            return;
        }

        let userToWarn;
        
        // Check for mentioned users
        if (mentionedJids && mentionedJids.length > 0) {
            userToWarn = mentionedJids[0];
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToWarn = message.message.extendedTextMessage.contextInfo.participant;
        }
        
        if (!userToWarn) {
            await sock.sendMessage(chatId, { 
                text: '❌ Erreur: Veuillez mentionner l'utilisateur or reply to their message to warn!'
            });
            return;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // Read warnings, create empty object if file is empty
            let warnings = {};
            try {
                warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
            } catch (Erreur) {
                warnings = {};
            }

            // Initialize nested objects if they don't exist
            if (!warnings[chatId]) warnings[chatId] = {};
            if (!warnings[chatId][userToWarn]) warnings[chatId][userToWarn] = 0;
            
            warnings[chatId][userToWarn]++;
            fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));

            const warningMessage = `*『 WARNING ALERT 』*\n\n` +
                `👤 *Warned User:* @${userToWarn.split('@')[0]}\n` +
                `⚠️ *Warning Count:* ${warnings[chatId][userToWarn]}/3\n` +
                `👑 *Warned By:* @${senderId.split('@')[0]}\n\n` +
                `📅 *Date:* ${new Date().toLocaleString()}`;

            await sock.sendMessage(chatId, { 
                text: warningMessage,
                mentions: [userToWarn, senderId]
            });

            // Auto-kick after 3 warnings
            if (warnings[chatId][userToWarn] >= 3) {
                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));

                await sock.groupParticipantsUpdate(chatId, [userToWarn], "remove");
                delete warnings[chatId][userToWarn];
                fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
                
                const kickMessage = `*『 AUTO-KICK 』*\n\n` +
                    `@${userToWarn.split('@')[0]} has been removed from the Groupe after receiving 3 warnings! ⚠️`;

                await sock.sendMessage(chatId, { 
                    text: kickMessage,
                    mentions: [userToWarn]
                });
            }
        } catch (Erreur) {
            console.Erreur('Erreur in warn command:', Erreur);
            await sock.sendMessage(chatId, { 
                text: '❌ Échec de : warn user!'
            });
        }
    } catch (Erreur) {
        console.Erreur('Erreur in warn command:', Erreur);
        if (Erreur.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            try {
                await sock.sendMessage(chatId, { 
                    text: '❌ Rate limit reached. Please try again in a few seconds.'
                });
            } catch (retryError) {
                console.Erreur('Erreur Envoi de retry message:', retryError);
            }
        } else {
            try {
                await sock.sendMessage(chatId, { 
                    text: '❌ Échec de : warn user. Make sure the bot is Admin and has sufficient permissions.'
                });
            } catch (sendError) {
                console.Erreur('Erreur Envoi de Erreur message:', sendError);
            }
        }
    }
}

module.exports = warnCommand;
