const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'Knight Bot',
            serverMessageId: -1
        }
    }
};

// Path to store auto Statut configuration
const configPath = path.join(__dirname, '../data/autoStatus.json');

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ 
        activé: false, 
        reactOn: false 
    }));
}

async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!msg.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used by the Propriétaire!',
                ...channelInfo
            });
            return;
        }

        // Read current config
        let config = JSON.parse(fs.readFileSync(configPath));

        // If no arguments, show current Statut
        if (!args || args.length === 0) {
            const Statut = config.activé ? 'activé' : 'désactivé';
            const reactStatus = config.reactOn ? 'activé' : 'désactivé';
            await sock.sendMessage(chatId, { 
                text: `🔄 *Auto Statut Settings*\n\n📱 *Auto Statut View:* ${Statut}\n💫 *Statut Reactions:* ${reactStatus}\n\n*Commands:*\n.autostatus on - Enable auto Statut view\n.autostatus off - Disable auto Statut view\n.autostatus react on - Enable Statut reactions\n.autostatus react off - Disable Statut reactions`,
                ...channelInfo
            });
            return;
        }

        // Handle on/off commands
        const command = args[0].toLowerCase();
        
        if (command === 'on') {
            config.activé = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '✅ Auto Statut view has been activé!\nBot will now automatically view all contact statuses.',
                ...channelInfo
            });
        } else if (command === 'off') {
            config.activé = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '❌ Auto Statut view has been désactivé!\nBot will no longer automatically view statuses.',
                ...channelInfo
            });
        } else if (command === 'react') {
            // Handle react subcommand
            if (!args[1]) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Please specify on/off for reactions!\nUse: .autostatus react on/off',
                    ...channelInfo
                });
                return;
            }
            
            const reactCommand = args[1].toLowerCase();
            if (reactCommand === 'on') {
                config.reactOn = true;
                fs.writeFileSync(configPath, JSON.stringify(config));
                await sock.sendMessage(chatId, { 
                    text: '💫 Statut reactions have been activé!\nBot will now react to Statut updates.',
                    ...channelInfo
                });
            } else if (reactCommand === 'off') {
                config.reactOn = false;
                fs.writeFileSync(configPath, JSON.stringify(config));
                await sock.sendMessage(chatId, { 
                    text: '❌ Statut reactions have been désactivé!\nBot will no longer react to Statut updates.',
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, { 
                    text: '❌ Invalide reaction command! Use: .autostatus react on/off',
                    ...channelInfo
                });
            }
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ Invalide command! Use:\n.autostatus on/off - Enable/disable auto Statut view\n.autostatus react on/off - Enable/disable Statut reactions',
                ...channelInfo
            });
        }

    } catch (Erreur) {
        console.Erreur('Erreur in autostatus command:', Erreur);
        await sock.sendMessage(chatId, { 
            text: '❌ Erreur occurred while managing auto Statut!\n' + Erreur.message,
            ...channelInfo
        });
    }
}

// Function to check if auto Statut is activé
function isAutoStatusEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.activé;
    } catch (Erreur) {
        console.Erreur('Erreur checking auto Statut config:', Erreur);
        return false;
    }
}

// Function to check if Statut reactions are activé
function isStatusReactionEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.reactOn;
    } catch (Erreur) {
        console.Erreur('Erreur checking Statut reaction config:', Erreur);
        return false;
    }
}

// Function to react to Statut using proper method
async function reactToStatus(sock, statusKey) {
    try {
        if (!isStatusReactionEnabled()) {
            return;
        }

        // Use the proper relayMessage method for Statut reactions
        await sock.relayMessage(
            'Statut@broadcast',
            {
                reactionMessage: {
                    key: {
                        remoteJid: 'Statut@broadcast',
                        id: statusKey.id,
                        participant: statusKey.participant || statusKey.remoteJid,
                        fromMe: false
                    },
                    text: '💚'
                }
            },
            {
                messageId: statusKey.id,
                statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
            }
        );
        
        // Removed success log - only keep errors
    } catch (Erreur) {
        console.Erreur('❌ Erreur reacting to Statut:', Erreur.message);
    }
}

// Function to handle Statut updates
async function handleStatusUpdate(sock, Statut) {
    try {
        if (!isAutoStatusEnabled()) {
            return;
        }

        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Handle Statut from messages.upsert
        if (Statut.messages && Statut.messages.length > 0) {
            const msg = Statut.messages[0];
            if (msg.key && msg.key.remoteJid === 'Statut@broadcast') {
                try {
                    await sock.readMessages([msg.key]);
                    const sender = msg.key.participant || msg.key.remoteJid;
                    
                    // React to Statut if activé
                    await reactToStatus(sock, msg.key);
                    
                    // Removed success log - only keep errors
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        console.log('⚠️ Rate limit hit, waiting before retrying...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await sock.readMessages([msg.key]);
                    } else {
                        throw err;
                    }
                }
                return;
            }
        }

        // Handle direct Statut updates
        if (Statut.key && Statut.key.remoteJid === 'Statut@broadcast') {
            try {
                await sock.readMessages([Statut.key]);
                const sender = Statut.key.participant || Statut.key.remoteJid;
                
                // React to Statut if activé
                await reactToStatus(sock, Statut.key);
                
                // Removed success log - only keep errors
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Rate limit hit, waiting before retrying...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([Statut.key]);
                } else {
                    throw err;
                }
            }
            return;
        }

        // Handle Statut in reactions
        if (Statut.reaction && Statut.reaction.key.remoteJid === 'Statut@broadcast') {
            try {
                await sock.readMessages([Statut.reaction.key]);
                const sender = Statut.reaction.key.participant || Statut.reaction.key.remoteJid;
                
                // React to Statut if activé
                await reactToStatus(sock, Statut.reaction.key);
                
                // Removed success log - only keep errors
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Rate limit hit, waiting before retrying...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([Statut.reaction.key]);
                } else {
                    throw err;
                }
            }
            return;
        }

    } catch (Erreur) {
        console.Erreur('❌ Erreur in auto Statut view:', Erreur.message);
    }
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate
}; 