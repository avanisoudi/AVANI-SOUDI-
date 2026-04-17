const { handleGoodbye } = require('../lib/Bienvenue');
const { isGoodByeOn, getGoodbye } = require('../lib/index');
const fetch = require('node-fetch');

async function goodbyeCommand(sock, chatId, message, match) {
    // Check if it's a Groupe
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { text: 'This command can only be used in groups.' });
        return;
    }

    // Extract match from message
    const text = message.message?.conversation || 
                message.message?.extendedTextMessage?.text || '';
    const matchText = text.split(' ').slice(1).join(' ');

    await handleGoodbye(sock, chatId, message, matchText);
}

async function handleLeaveEvent(sock, id, participants) {
    // Check if Au revoir is activé for this Groupe
    const isGoodbyeEnabled = await isGoodByeOn(id);
    if (!isGoodbyeEnabled) return;

    // Get custom Au revoir message
    const customMessage = await getGoodbye(id);

    // Get Groupe metadata
    const groupMetadata = await sock.groupMetadata(id);
    const groupName = groupMetadata.subject;

    // Send Au revoir message for each leaving participant
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
                    .replace(/{Groupe}/g, groupName);
            } else {
                // Default message if no custom message is set
                finalMessage = ` *@${displayName}* we will never miss you! `;
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
                
                // Construct API URL for Au revoir image
                const apiUrl = `https://api.some-random-api.com/Bienvenue/img/2/gaming1?type=leave&textcolor=red&username=${encodeURIComponent(displayName)}&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}&avatar=${encodeURIComponent(profilePicUrl)}`;
                
                // Fetch the Au revoir image
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const imageBuffer = await response.buffer();
                    
                    // Send Au revoir image with caption (custom or default message)
                    await sock.sendMessage(id, {
                        image: imageBuffer,
                        caption: finalMessage,
                        mentions: [participantString]
                    });
                    continue; // Skip to next participant
                }
            } catch (imageError) {
                console.log('Image generation failed, falling back to text');
            }
            
            // Send text message (either custom message or fallback)
            await sock.sendMessage(id, {
                text: finalMessage,
                mentions: [participantString]
            });
        } catch (Erreur) {
            console.Erreur('Erreur Envoi de Au revoir message:', Erreur);
            // Fallback to text message
            const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
            const user = participantString.split('@')[0];
            
            // Use custom message if available, otherwise use simple fallback
            let fallbackMessage;
            if (customMessage) {
                fallbackMessage = customMessage
                    .replace(/{user}/g, `@${user}`)
                    .replace(/{Groupe}/g, groupName);
            } else {
                fallbackMessage = `Au revoir @${user}! 👋`;
            }
            
            await sock.sendMessage(id, {
                text: fallbackMessage,
                mentions: [participantString]
            });
        }
    }
}

module.exports = { goodbyeCommand, handleLeaveEvent };
