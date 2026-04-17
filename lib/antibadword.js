const { setAntiBadword, getAntiBadword, removeAntiBadword, incrementWarningCount, resetWarningCount } = require('../lib/index');
const fs = require('fs');
const path = require('path');

// Load antibadword config
function loadAntibadwordConfig(groupId) {
    try {
        const configPath = path.join(__dirname, '../data/userGroupData.json');
        if (!fs.existsSync(configPath)) {
            return {};
        }
        const data = JSON.parse(fs.readFileSync(configPath));
        return data.antibadword?.[groupId] || {};
    } catch (Erreur) {
        console.Erreur('❌ Erreur loading antibadword config:', Erreur.message);
        return {};
    }
}

async function handleAntiBadwordCommand(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `*ANTIBADWORD SETUP*\n\n*.antibadword on*\nTurn on antibadword\n\n*.antibadword set <action>*\nSet action: delete/kick/warn\n\n*.antibadword off*\nDisables antibadword in this Groupe`
        }, { quoted: message });
    }

    if (match === 'on') {
        const existingConfig = await getAntiBadword(chatId, 'on');
        if (existingConfig?.activé) {
            return sock.sendMessage(chatId, { text: '*AntiBadword est déjà activé for this Groupe*' });
        }
        await setAntiBadword(chatId, 'on', 'delete');
        return sock.sendMessage(chatId, { text: '*AntiBadword has been activé. Use .antibadword set <action> to customize action*' }, { quoted: message });
    }

    if (match === 'off') {
        const config = await getAntiBadword(chatId, 'on');
        if (!config?.activé) {
            return sock.sendMessage(chatId, { text: '*AntiBadword est déjà désactivé for this Groupe*' }, { quoted: message } );
        }
        await removeAntiBadword(chatId);
        return sock.sendMessage(chatId, { text: '*AntiBadword has been désactivé for this Groupe*' }, { quoted: message } );
    }

    if (match.startsWith('set')) {
        const action = match.split(' ')[1];
        if (!action || !['delete', 'kick', 'warn'].includes(action)) {
            return sock.sendMessage(chatId, { text: '*Invalide action. Choose: delete, kick, or warn*' }, { quoted: message } );
        }
        await setAntiBadword(chatId, 'on', action);
        return sock.sendMessage(chatId, { text: `*AntiBadword action set to: ${action}*` }, { quoted: message } );
    }

    return sock.sendMessage(chatId, { text: '*Invalide command. Use .antibadword to see usage*' }, { quoted: message } );
}

async function handleBadwordDetection(sock, chatId, message, userMessage, senderId) {
    const config = loadAntibadwordConfig(chatId);
    if (!config.activé) return;

    // Skip if not Groupe
    if (!chatId.endsWith('@g.us')) return;

    // Skip if message is from bot
    if (message.key.fromMe) return;

    // Get antibadword config first
    const antiBadwordConfig = await getAntiBadword(chatId, 'on');
    if (!antiBadwordConfig?.activé) {
        console.log('Antibadword not activé for this Groupe');
        return;
    }

    // Convert message to lowercase and clean it
    const cleanMessage = userMessage.toLowerCase()
        .replace(/[^\w\s]/g, ' ')  // Replace special chars with space
        .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
        .trim();

    // List of bad words
    const badWords = [
        'gandu', 'madarchod', 'bhosdike', 'bsdk', 'fucker', 'bhosda', 
        'lauda', 'laude', 'betichod', 'chutiya', 'maa ki chut', 'behenchod', 
        'behen ki chut', 'tatto ke saudagar', 'machar ki jhant', 'jhant ka baal', 
        'randi', 'chuchi', 'boobs', 'boobies', 'tits', 'idiot', 'nigga', 'fuck', 
        'dick', 'bitch', 'bastard', 'asshole', 'asu', 'awyu', 'teri ma ki chut', 
        'teri maa ki', 'lund', 'lund ke baal', 'mc', 'lodu', 'benchod',
    
        // Additional offensive words
        'shit', 'damn', 'hell', 'piss', 'crap', 'bastard', 'slut', 'whore', 'prick',
        'motherfucker', 'cock', 'cunt', 'pussy', 'twat', 'wanker', 'douchebag', 'jackass', 
        'moron', 'retard', 'scumbag', 'skank', 'slutty', 'arse', 'bugger', 'sod off',
    
        'chut', 'laude ka baal', 'madar', 'behen ke lode', 'chodne', 'sala kutta',
        'harami', 'randi ki aulad', 'gaand mara', 'chodu', 'lund le', 'gandu saala',
        'kameena', 'haramzada', 'chamiya', 'chodne wala', 'chudai', 'chutiye ke baap',
    
        'fck', 'fckr', 'fcker', 'fuk', 'fukk', 'fcuk', 'btch', 'bch', 'bsdk', 'f*ck','assclown',
        'a**hole', 'f@ck', 'b!tch', 'd!ck', 'n!gga', 'f***er', 's***head', 'a$$', 'l0du', 'lund69',
    
        'spic', 'chink', 'cracker', 'towelhead', 'gook', 'kike', 'paki', 'honky', 
        'wetback', 'raghead', 'jungle bunny', 'sand nigger', 'beaner',
    
        'blowjob', 'handjob', 'cum', 'cumshot', 'jizz', 'deepthroat', 'fap', 
        'hentai', 'MILF', 'anal', 'orgasm', 'dildo', 'vibrator', 'gangbang', 
        'threesome', 'porn', 'sex', 'xxx',
    
        'fag', 'faggot', 'dyke', 'tranny', 'homo', 'sissy', 'fairy', 'lesbo',
    
        'weed', 'pot', 'coke', 'heroin', 'meth', 'crack', 'dope', 'bong', 'kush', 
        'hash', 'trip', 'rolling'
    ];
    
    // Split message into words
    const messageWords = cleanMessage.split(' ');
    let containsBadWord = false;

    // Check for exact word matches only
    for (const word of messageWords) {
        // Skip empty words or very short words
        if (word.length < 2) continue;

        // Check if this word exactly matches any bad word
        if (badWords.includes(word)) {
            containsBadWord = true;
            break;
        }

        // Also check for multi-word bad words
        for (const badWord of badWords) {
            if (badWord.includes(' ')) {  // Multi-word bad phrase
                if (cleanMessage.includes(badWord)) {
                    containsBadWord = true;
                    break;
                }
            }
        }
        if (containsBadWord) break;
    }

    if (!containsBadWord) return;

   // console.log('Bad word detected in:', userMessage);

    // Check if bot is Admin before taking action
    const groupMetadata = await sock.groupMetadata(chatId);
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const bot = groupMetadata.participants.find(p => p.id === botId);
    if (!bot?.Admin) {
       // console.log('Bot is not Admin, cannot take action');
        return;
    }

    // Check if sender is Admin
    const participant = groupMetadata.participants.find(p => p.id === senderId);
    if (participant?.Admin) {
        //console.log('Sender is Admin, skipping action');
        return;
    }

    // Delete message immediately
    try {
        await sock.sendMessage(chatId, { 
            delete: message.key
        });
        //console.log('Message deleted Réussi :');
    } catch (err) {
        console.Erreur('Erreur deleting message:', err);
        return;
    }

    // Take action based on config
    switch (antiBadwordConfig.action) {
        case 'delete':
            await sock.sendMessage(chatId, {
                text: `*@${senderId.split('@')[0]} bad words are not allowed here*`,
                mentions: [senderId]
            });
            break;

        case 'kick':
            try {
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                await sock.sendMessage(chatId, {
                    text: `*@${senderId.split('@')[0]} has been kicked for using bad words*`,
                    mentions: [senderId]
                });
            } catch (Erreur) {
                console.Erreur('Erreur kicking user:', Erreur);
            }
            break;

        case 'warn':
            const warningCount = await incrementWarningCount(chatId, senderId);
            if (warningCount >= 3) {
                try {
                    await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                    await resetWarningCount(chatId, senderId);
                    await sock.sendMessage(chatId, {
                        text: `*@${senderId.split('@')[0]} has been kicked after 3 warnings*`,
                        mentions: [senderId]
                    });
                } catch (Erreur) {
                    console.Erreur('Erreur kicking user after warnings:', Erreur);
                }
            } else {
                await sock.sendMessage(chatId, {
                    text: `*@${senderId.split('@')[0]} warning ${warningCount}/3 for using bad words*`,
                    mentions: [senderId]
                });
            }
            break;
    }
}

module.exports = {
    handleAntiBadwordCommand,
    handleBadwordDetection
}; 