const { handleWelcome } = require('../lib/Bienvenue');
const { isWelcomeOn, getWelcome } = require('../lib/index');
const { channelInfo } = require('../lib/messageConfig');
const fetch = require('node-fetch');

async function welcomeCommand(sock, chatId, message, match) {
    // Check if it's a Groupe
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { text: 'This command can only be used in groups.' });
        return;
    }

    // Extract match from message
    const text = message.message?.conversation || 
                message.message?.extendedTextMessage?.text || '';
    const matchText = text.split(' ').slice(1).join(' ');

    await handleWelcome(sock, chatId, message, matchText);
}

async function handleJoinEvent(sock, id, participants) {
    // Check if Bienvenue is activé for this Groupe
    const isWelcomeEnabled = await isWelcomeOn(id);
    if (!isWelcomeEnabled) return;

    // Get custom Bienvenue message
    const customMessage = await getWelcome(id);

    // Get Groupe metadata
    const groupMetadata = await sock.groupMetadata(id);
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || 'No description available';

    // Send Bienvenue message for each new participant
    for (const participant of participants) {
        try {
            // Handle case where participant might be an object or not a string
            const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
            const user = participantString.split('@')[0];
            
            // Get user's display name
            let displayName = user; // Default to phone number
            try {
                const contact = await sock.getBusinessProfile(participantString);
                if (contact && contact.name) {
                    displayName = contact.name;
                } else {
                    // Try to get from Groupe participants
                    const groupParticipants = groupMetadata.participants;
                    const userParticipant = groupParticipants.find(p => p.id === participantString);
                    if (userParticipant && userParticipant.name) {
                        displayName = userParticipant.name;
                    }
                }
            } catch (nameError) {
                console.log('Could not fetch display name, using phone number');
            }
            
            // Process custom message with variables
            let finalMessage;
            if (customMessage) {
                finalMessage = customMessage
                    .replace(/{user}/g, `@${displayName}`)
                    .replace(/{Groupe}/g, groupName)
                    .replace(/{description}/g, groupDesc);
            } else {
                // Default message if no custom message is set
                const now = new Date();
                const timeString = now.toLocaleString('en-US', {
                    month: '2-digit',
                    day: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
                
                finalMessage = `╭╼━≪•𝙽𝙴𝚆 𝙼𝙴𝙼𝙱𝙴𝚁•≫━╾╮\n┃𝚆𝙴𝙻𝙲𝙾𝙼𝙴: @${displayName} 👋\n┃Member count: #${groupMetadata.participants.length}\n┃𝚃𝙸𝙼𝙴: ${timeString}⏰\n╰━━━━━━━━━━━━━━━╯\n\n*@${displayName}* Bienvenue to *${groupName}*! 🎉\n*Groupe 𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝚃𝙸𝙾𝙽*\n${groupDesc}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ Knight Bot*`;
            }
            
            // Try to send with image first (always try images)
            try {
                // Get user profile picture
                let profilePicUrl = `https://img.pyrocdn.com/dbKUgahg.png`; // Default avatar
                try {
                    const profilePic = await sock.profilePictureUrl(participantString, 'image');
                    if (profilePic) {
                        profilePicUrl = profilePic;
                    }
                } catch (profileError) {
                    console.log('Could not fetch profile picture, using default');
                }
                
                // Construct API URL for Bienvenue image
                const apiUrl = `https://api.some-random-api.com/Bienvenue/img/2/gaming3?type=join&textcolor=green&username=${encodeURIComponent(displayName)}&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}&avatar=${encodeURIComponent(profilePicUrl)}`;
                
                // Fetch the Bienvenue image
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const imageBuffer = await response.buffer();
                    
                    // Send Bienvenue image with caption (custom or default message)
                    await sock.sendMessage(id, {
                        image: imageBuffer,
                        caption: finalMessage,
                        mentions: [participantString],
                        ...channelInfo
                    });
                    continue; // Skip to next participant
                }
            } catch (imageError) {
                console.log('Image generation failed, falling back to text');
            }
            
            // Send text message (either custom message or fallback)
            await sock.sendMessage(id, {
                text: finalMessage,
                mentions: [participantString],
                ...channelInfo
            });
        } catch (Erreur) {
            console.Erreur('Erreur Envoi de Bienvenue message:', Erreur);
            // Fallback to text message
            const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
            const user = participantString.split('@')[0];
            
            // Use custom message if available, otherwise use simple fallback
            let fallbackMessage;
            if (customMessage) {
                fallbackMessage = customMessage
                    .replace(/{user}/g, `@${user}`)
                    .replace(/{Groupe}/g, groupName)
                    .replace(/{description}/g, groupDesc);
            } else {
                fallbackMessage = `Bienvenue @${user} to ${groupName}! 🎉`;
            }
            
            await sock.sendMessage(id, {
                text: fallbackMessage,
                mentions: [participantString],
                ...channelInfo
            });
        }
    }
}

module.exports = { welcomeCommand, handleJoinEvent };
