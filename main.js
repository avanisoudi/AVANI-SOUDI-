const fs = require('fs');
const path = require('path');

// Redirect temp storage away from system /tmp
const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) fs.mkdirSync(customTemp, { recursive: true });
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

// Auto-cleaner every 3 hours
setInterval(() => {
    fs.readdir(customTemp, (err, files) => {
        if (err) return;
        for (const file of files) {
            const filePath = path.join(customTemp, file);
            fs.stat(filePath, (err, stats) => {
                if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
                    fs.unlink(filePath, () => { });
                }
            });
        }
    });
    console.log('🧹 Temp folder auto-cleaned');
}, 3 * 60 * 60 * 1000);

const settings = require('./settings');
require('./config.js');
const { isBanned } = require('./lib/isBanned');
const yts = require('yt-search');
const { fetchBuffer } = require('./lib/myfunc');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { isSudo } = require('./lib/index');
const isOwnerOrSudo = require('./lib/isOwner');
const { autotypingCommand, isAutotypingEnabled, handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand } = require('./commands/autotyping');
const { autoreadCommand, isAutoreadEnabled, handleAutoread } = require('./commands/autoread');

// Command imports
const tagAllCommand = require('./commands/tagall');
const helpCommand = require('./commands/help');
const banCommand = require('./commands/ban');
const { promoteCommand } = require('./commands/promote');
const { demoteCommand } = require('./commands/demote');
const muteCommand = require('./commands/mute');
const unmuteCommand = require('./commands/unmute');
const stickerCommand = require('./commands/sticker');
const isAdmin = require('./lib/isAdmin');
const warnCommand = require('./commands/warn');
const warningsCommand = require('./commands/warnings');
const ttsCommand = require('./commands/tts');
const { tictactoeCommand, handleTicTacToeMove } = require('./commands/tictactoe');
const { incrementMessageCount, topMembers } = require('./commands/topmembers');
const ownerCommand = require('./commands/owner');
const deleteCommand = require('./commands/delete');
const { handleAntilinkCommand, handleLinkDetection } = require('./commands/antilink');
const { handleAntitagCommand, handleTagDetection } = require('./commands/antitag');
const { Antilink } = require('./lib/antilink');
const { handleMentionDetection, mentionToggleCommand, setMentionCommand } = require('./commands/mention');
const memeCommand = require('./commands/meme');
const tagCommand = require('./commands/tag');
const tagNotAdminCommand = require('./commands/tagnotadmin');
const hideTagCommand = require('./commands/hidetag');
const jokeCommand = require('./commands/joke');
const quoteCommand = require('./commands/quote');
const factCommand = require('./commands/fact');
const weatherCommand = require('./commands/weather');
const newsCommand = require('./commands/news');
const kickCommand = require('./commands/kick');
const simageCommand = require('./commands/simage');
const attpCommand = require('./commands/attp');
const { startHangman, guessLetter } = require('./commands/hangman');
const { startTrivia, answerTrivia } = require('./commands/trivia');
const { complimentCommand } = require('./commands/compliment');
const { insultCommand } = require('./commands/insult');
const { eightBallCommand } = require('./commands/eightball');
const { lyricsCommand } = require('./commands/lyrics');
const { dareCommand } = require('./commands/dare');
const { truthCommand } = require('./commands/truth');
const { clearCommand } = require('./commands/clear');
const pingCommand = require('./commands/ping');
const aliveCommand = require('./commands/alive');
const blurCommand = require('./commands/img-blur');
const { welcomeCommand, handleJoinEvent } = require('./commands/welcome');
const { goodbyeCommand, handleLeaveEvent } = require('./commands/goodbye');
const githubCommand = require('./commands/github');
const { handleAntiBadwordCommand, handleBadwordDetection } = require('./lib/antibadword');
const antibadwordCommand = require('./commands/antibadword');
const { handleChatbotCommand, handleChatbotResponse } = require('./commands/chatbot');
const takeCommand = require('./commands/take');
const { flirtCommand } = require('./commands/flirt');
const characterCommand = require('./commands/character');
const wastedCommand = require('./commands/wasted');
const shipCommand = require('./commands/ship');
const groupInfoCommand = require('./commands/groupinfo');
const resetlinkCommand = require('./commands/resetlink');
const staffCommand = require('./commands/staff');
const unbanCommand = require('./commands/unban');
const emojimixCommand = require('./commands/emojimix');
const { handlePromotionEvent } = require('./commands/promote');
const { handleDemotionEvent } = require('./commands/demote');
const viewOnceCommand = require('./commands/viewonce');
const clearSessionCommand = require('./commands/clearsession');
const { autoStatusCommand, handleStatusUpdate } = require('./commands/autostatus');
const { simpCommand } = require('./commands/simp');
const { stupidCommand } = require('./commands/stupid');
const stickerTelegramCommand = require('./commands/stickertelegram');
const textmakerCommand = require('./commands/textmaker');
const { handleAntideleteCommand, handleMessageRevocation, storeMessage } = require('./commands/antidelete');
const clearTmpCommand = require('./commands/cleartmp');
const setProfilePicture = require('./commands/setpp');
const { setGroupDescription, setGroupName, setGroupPhoto } = require('./commands/groupmanage');
const instagramCommand = require('./commands/instagram');
const facebookCommand = require('./commands/facebook');
const spotifyCommand = require('./commands/spotify');
const playCommand = require('./commands/play');
const tiktokCommand = require('./commands/tiktok');
const songCommand = require('./commands/song');
const aiCommand = require('./commands/ai');
const urlCommand = require('./commands/url');
const { handleTranslateCommand } = require('./commands/translate');
const { handleSsCommand } = require('./commands/ss');
const { addCommandReaction, handleAreactCommand } = require('./lib/reactions');
const { goodnightCommand } = require('./commands/goodnight');
const { shayariCommand } = require('./commands/shayari');
const { rosedayCommand } = require('./commands/roseday');
const imagineCommand = require('./commands/imagine');
const videoCommand = require('./commands/video');
const sudoCommand = require('./commands/sudo');
const { miscCommand, handleHeart } = require('./commands/misc');
const { animeCommand } = require('./commands/anime');
const { piesCommand, piesAlias } = require('./commands/pies');
const stickercropCommand = require('./commands/stickercrop');
const updateCommand = require('./commands/update');
const removebgCommand = require('./commands/removebg');
const { reminiCommand } = require('./commands/remini');
const { igsCommand } = require('./commands/igs');
const { anticallCommand, readState: readAnticallState } = require('./commands/anticall');
const { pmblockerCommand, readState: readPmBlockerState } = require('./commands/pmblocker');
const settingsCommand = require('./commands/settings');
const soraCommand = require('./commands/sora');

// Global settings
global.packname = settings.packname;
global.author = settings.author;
global.channelLink = "";
global.ytch = "Knight Bot";

// Add this near the top of main.js with other global configurations
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

async function handleMessages(sock, messageUpdate, printLog) {
    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;

        // Handle autoread functionality
        await handleAutoread(sock, message);

        // Store message for antidelete feature
        if (message.message) {
            storeMessage(sock, message);
        }

        // Handle message revocation
        if (message.message?.protocolMessage?.type === 0) {
            await handleMessageRevocation(sock, message);
            return;
        }

        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const senderIsSudo = await isSudo(senderId);
        const senderIsOwnerOrSudo = await isOwnerOrSudo(senderId, sock, chatId);

        // Handle button responses
        if (message.message?.buttonsResponseMessage) {
            const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
            const chatId = message.key.remoteJid;

            if (buttonId === 'channel') {
                await sock.sendMessage(chatId, {
                    text: '📢 *Bot actif !*'
                }, { quoted: message });
                return;
            } else if (buttonId === 'owner') {
                const ownerCommand = require('./commands/owner');
                await ownerCommand(sock, chatId);
                return;
            } else if (buttonId === 'support') {
                await sock.sendMessage(chatId, {
                    text: `🔗 *Support*\n\nContactez l'administrateur.`
                }, { quoted: message });
                return;
            }
        }

        const userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            message.message?.buttonsResponseMessage?.selectedButtonId?.trim() ||
            ''
        ).toLowerCase().replace(/\.\s+/g, '.').trim();

        // Preserve raw message for commands like .tag that need original casing
        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        // Only log command usage
        if (userMessage.startsWith('.')) {
            console.log(`📝 Command used in ${isGroup ? 'group' : 'private'}: ${userMessage}`);
        }
        // Read bot mode once; don't early-return so moderation can still run in private mode
        let isPublic = true;
        try {
            const data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof data.isPublic === 'boolean') isPublic = data.isPublic;
        } catch (error) {
            console.error('Error checking access mode:', error);
            // default isPublic=true on error
        }
        const isOwnerOrSudoCheck = message.key.fromMe || senderIsOwnerOrSudo;
        // Check if user is banned (skip ban check for unban command)
        if (isBanned(senderId) && !userMessage.startsWith('.unban')) {
            // Only respond occasionally to avoid spam
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, {
                    text: '❌ Vous êtes banni de l\'utilisation du bot. Contactez un administrateur pour être débanni.',
                    ...channelInfo
                });
            }
            return;
        }

        // First check if it's a game move
        if (handleTicTacToeMove) {
            const moveHandled = await handleTicTacToeMove(sock, chatId, senderId, userMessage);
            if (moveHandled) return;
        }

        // Increment message count for top members
        if (isGroup) {
            await incrementMessageCount(chatId, senderId);
        }

        // Auto-typing handling
        await handleAutotypingForMessage(sock, chatId);

        // Mention detection
        await handleMentionDetection(sock, chatId, message);

        // Link detection (Antilink)
        if (isGroup) {
            const linkDetected = await handleLinkDetection(sock, chatId, message);
            if (linkDetected) return;
        }

        // Tag detection (Antitag)
        if (isGroup) {
            const tagDetected = await handleTagDetection(sock, chatId, message);
            if (tagDetected) return;
        }

        // Badword detection
        if (isGroup) {
            const badwordDetected = await handleBadwordDetection(sock, chatId, message);
            if (badwordDetected) return;
        }

        // Chatbot response
        if (!userMessage.startsWith('.')) {
            await handleChatbotResponse(sock, chatId, message);
        }

        // Command handling
        if (userMessage.startsWith('.')) {
            const command = userMessage.slice(1).split(' ')[0];
            const args = userMessage.slice(1).split(' ').slice(1);
            const text = args.join(' ');

            // Check bot mode
            if (!isPublic && !isOwnerOrSudoCheck) {
                return;
            }

            // Execute commands
            switch (command) {
                case 'help':
                case 'menu':
                    await helpCommand(sock, chatId, message);
                    break;
                case 'ping':
                    await pingCommand(sock, chatId, message);
                    break;
                case 'alive':
                    await aliveCommand(sock, chatId, message);
                    break;
                case 'ban':
                    await banCommand(sock, chatId, message);
                    break;
                case 'promote':
                    await promoteCommand(sock, chatId, message);
                    break;
                case 'demote':
                    await demoteCommand(sock, chatId, message);
                    break;
                case 'mute':
                    await muteCommand(sock, chatId, message, args);
                    break;
                case 'unmute':
                    await unmuteCommand(sock, chatId, message);
                    break;
                case 'sticker':
                case 's':
                    await stickerCommand(sock, chatId, message);
                    break;
                case 'warn':
                    await warnCommand(sock, chatId, message);
                    break;
                case 'warnings':
                    await warningsCommand(sock, chatId, message);
                    break;
                case 'tts':
                    await ttsCommand(sock, chatId, message, text);
                    break;
                case 'tictactoe':
                case 'ttt':
                    await tictactoeCommand(sock, chatId, message);
                    break;
                case 'top':
                    await topMembers(sock, chatId, message);
                    break;
                case 'owner':
                    await ownerCommand(sock, chatId);
                    break;
                case 'delete':
                case 'del':
                    await deleteCommand(sock, chatId, message);
                    break;
                case 'antilink':
                    await handleAntilinkCommand(sock, chatId, message, args);
                    break;
                case 'antitag':
                    await handleAntitagCommand(sock, chatId, message, args);
                    break;
                case 'mention':
                    await mentionToggleCommand(sock, chatId, message, args);
                    break;
                case 'setmention':
                    await setMentionCommand(sock, chatId, message);
                    break;
                case 'meme':
                    await memeCommand(sock, chatId, message);
                    break;
                case 'tag':
                    await tagCommand(sock, chatId, message, rawText);
                    break;
                case 'tagall':
                    await tagAllCommand(sock, chatId, message, rawText);
                    break;
                case 'tagnotadmin':
                    await tagNotAdminCommand(sock, chatId, message, rawText);
                    break;
                case 'hidetag':
                    await hideTagCommand(sock, chatId, message, rawText);
                    break;
                case 'joke':
                    await jokeCommand(sock, chatId, message);
                    break;
                case 'quote':
                    await quoteCommand(sock, chatId, message);
                    break;
                case 'fact':
                    await factCommand(sock, chatId, message);
                    break;
                case 'weather':
                    await weatherCommand(sock, chatId, message, text);
                    break;
                case 'news':
                    await newsCommand(sock, chatId, message);
                    break;
                case 'kick':
                    await kickCommand(sock, chatId, message);
                    break;
                case 'simage':
                    await simageCommand(sock, chatId, message);
                    break;
                case 'attp':
                    await attpCommand(sock, chatId, message, text);
                    break;
                case 'hangman':
                    await startHangman(sock, chatId, message);
                    break;
                case 'guess':
                    await guessLetter(sock, chatId, message, args[0]);
                    break;
                case 'trivia':
                    await startTrivia(sock, chatId, message);
                    break;
                case 'answer':
                    await answerTrivia(sock, chatId, message, text);
                    break;
                case 'compliment':
                    await complimentCommand(sock, chatId, message);
                    break;
                case 'insult':
                    await insultCommand(sock, chatId, message);
                    break;
                case '8ball':
                    await eightBallCommand(sock, chatId, message, text);
                    break;
                case 'lyrics':
                    await lyricsCommand(sock, chatId, message, text);
                    break;
                case 'dare':
                    await dareCommand(sock, chatId, message);
                    break;
                case 'truth':
                    await truthCommand(sock, chatId, message);
                    break;
                case 'clear':
                    await clearCommand(sock, chatId, message);
                    break;
                case 'blur':
                    await blurCommand(sock, chatId, message);
                    break;
                case 'welcome':
                    await welcomeCommand(sock, chatId, message, args);
                    break;
                case 'goodbye':
                    await goodbyeCommand(sock, chatId, message, args);
                    break;
                case 'git':
                case 'github':
                case 'sc':
                case 'script':
                case 'repo':
                    await githubCommand(sock, chatId, message);
                    break;
                case 'antibadword':
                    await antibadwordCommand(sock, chatId, message, args);
                    break;
                case 'chatbot':
                    await handleChatbotCommand(sock, chatId, message, args);
                    break;
                case 'take':
                    await takeCommand(sock, chatId, message, text);
                    break;
                case 'flirt':
                    await flirtCommand(sock, chatId, message);
                    break;
                case 'character':
                    await characterCommand(sock, chatId, message);
                    break;
                case 'wasted':
                    await wastedCommand(sock, chatId, message);
                    break;
                case 'ship':
                    await shipCommand(sock, chatId, message);
                    break;
                case 'groupinfo':
                    await groupInfoCommand(sock, chatId, message);
                    break;
                case 'resetlink':
                    await resetlinkCommand(sock, chatId, message);
                    break;
                case 'staff':
                case 'admins':
                    await staffCommand(sock, chatId, message);
                    break;
                case 'unban':
                    await unbanCommand(sock, chatId, message);
                    break;
                case 'emojimix':
                    await emojimixCommand(sock, chatId, message, text);
                    break;
                case 'vv':
                    await viewOnceCommand(sock, chatId, message);
                    break;
                case 'clearsession':
                    await clearSessionCommand(sock, chatId, message);
                    break;
                case 'autostatus':
                    await autoStatusCommand(sock, chatId, message, args);
                    break;
                case 'simp':
                    await simpCommand(sock, chatId, message);
                    break;
                case 'stupid':
                    await stupidCommand(sock, chatId, message, text);
                    break;
                case 'tgsticker':
                case 'tg':
                    await stickerTelegramCommand(sock, chatId, message);
                    break;
                case 'textmaker':
                case 'metallic':
                case 'ice':
                case 'snow':
                case 'impressive':
                case 'matrix':
                case 'light':
                case 'neon':
                case 'devil':
                case 'purple':
                case 'thunder':
                case 'leaves':
                case '1917':
                case 'arena':
                case 'hacker':
                case 'sand':
                case 'blackpink':
                case 'glitch':
                case 'fire':
                    await textmakerCommand(sock, chatId, message, command, text);
                    break;
                case 'antidelete':
                    await handleAntideleteCommand(sock, chatId, message, args);
                    break;
                case 'cleartmp':
                    await clearTmpCommand(sock, chatId, message);
                    break;
                case 'setpp':
                case 'setprofilepicture':
                    await setProfilePicture(sock, chatId, message);
                    break;
                case 'setgdesc':
                    await setGroupDescription(sock, chatId, message, text);
                    break;
                case 'setgname':
                    await setGroupName(sock, chatId, message, text);
                    break;
                case 'setgpp':
                    await setGroupPhoto(sock, chatId, message);
                    break;
                case 'instagram':
                case 'ig':
                    await instagramCommand(sock, chatId, message, text);
                    break;
                case 'facebook':
                case 'fb':
                    await facebookCommand(sock, chatId, message, text);
                    break;
                case 'spotify':
                    await spotifyCommand(sock, chatId, message, text);
                    break;
                case 'play':
                    await playCommand(sock, chatId, message, text);
                    break;
                case 'tiktok':
                    await tiktokCommand(sock, chatId, message, text);
                    break;
                case 'song':
                    await songCommand(sock, chatId, message, text);
                    break;
                case 'gpt':
                case 'ai':
                    await aiCommand(sock, chatId, message, text);
                    break;
                case 'url':
                    await urlCommand(sock, chatId, message);
                    break;
                case 'trt':
                case 'translate':
                    await handleTranslateCommand(sock, chatId, message, args);
                    break;
                case 'ss':
                    await handleSsCommand(sock, chatId, message, text);
                    break;
                case 'areact':
                    await handleAreactCommand(sock, chatId, message, args);
                    break;
                case 'goodnight':
                    await goodnightCommand(sock, chatId, message);
                    break;
                case 'shayari':
                    await shayariCommand(sock, chatId, message);
                    break;
                case 'roseday':
                    await rosedayCommand(sock, chatId, message);
                    break;
                case 'imagine':
                case 'flux':
                    await imagineCommand(sock, chatId, message, text);
                    break;
                case 'video':
                    await videoCommand(sock, chatId, message, text);
                    break;
                case 'sudo':
                    await sudoCommand(sock, chatId, message, args);
                    break;
                case 'heart':
                case 'horny':
                case 'circle':
                case 'lgbt':
                case 'lolice':
                case 'its-so-stupid':
                case 'namecard':
                case 'oogway':
                case 'tweet':
                case 'ytcomment':
                case 'comrade':
                case 'gay':
                case 'glass':
                case 'jail':
                case 'passed':
                case 'triggered':
                    await miscCommand(sock, chatId, message, command, text);
                    break;
                case 'nom':
                case 'poke':
                case 'cry':
                case 'kiss':
                case 'pat':
                case 'hug':
                case 'wink':
                case 'facepalm':
                    await animeCommand(sock, chatId, message, command);
                    break;
                case 'pies':
                    await piesCommand(sock, chatId, message, text);
                    break;
                case 'china':
                case 'indonesia':
                case 'japan':
                case 'korea':
                case 'hijab':
                    await piesAlias(sock, chatId, message, command);
                    break;
                case 'crop':
                    await stickercropCommand(sock, chatId, message);
                    break;
                case 'update':
                    await updateCommand(sock, chatId, message);
                    break;
                case 'removebg':
                    await removebgCommand(sock, chatId, message);
                    break;
                case 'remini':
                    await reminiCommand(sock, chatId, message);
                    break;
                case 'igs':
                case 'igsc':
                    await igsCommand(sock, chatId, message, text);
                    break;
                case 'anticall':
                    await anticallCommand(sock, chatId, message, args);
                    break;
                case 'pmblocker':
                    await pmblockerCommand(sock, chatId, message, args);
                    break;
                case 'settings':
                    await settingsCommand(sock, chatId, message);
                    break;
                case 'sora':
                    await soraCommand(sock, chatId, message, text);
                    break;
                case 'autotyping':
                    await autotypingCommand(sock, chatId, message, args);
                    break;
                case 'autoread':
                    await autoreadCommand(sock, chatId, message, args);
                    break;
            }

            // Handle auto-typing after command
            await handleAutotypingForCommand(sock, chatId);
        }
    } catch (error) {
        console.error('Error handling message:', error);
    }
}

module.exports = {
    handleMessages
};
