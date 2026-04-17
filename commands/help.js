const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
    const helpMessage = `
╔═══════════════════╗
   *🤖 ${settings.botName || 'KnightBot-MD'}*  
   Version: *${settings.version || '3.0.0'}*
   par ${settings.botOwner || 'Professeur'}
╚═══════════════════╝

*Commandes Disponibles :*

╔═══════════════════╗
🌐 *Commandes Générales*:
║ ➤ .help ou .menu
║ ➤ .ping
║ ➤ .alive
║ ➤ .tts <texte>
║ ➤ .owner
║ ➤ .joke
║ ➤ .quote
║ ➤ .fact
║ ➤ .weather <ville>
║ ➤ .news
║ ➤ .attp <texte>
║ ➤ .lyrics <titre>
║ ➤ .8ball <question>
║ ➤ .groupinfo
║ ➤ .staff ou .admins 
║ ➤ .vv
║ ➤ .trt <texte> <langue>
║ ➤ .ss <lien>
║ ➤ .jid
║ ➤ .url
╚═══════════════════╝ 

╔═══════════════════╗
👮‍♂️ *Commandes Admin*:
║ ➤ .ban @utilisateur
║ ➤ .promote @utilisateur
║ ➤ .demote @utilisateur
║ ➤ .mute <minutes>
║ ➤ .unmute
║ ➤ .delete ou .del
║ ➤ .kick @utilisateur
║ ➤ .warnings @utilisateur
║ ➤ .warn @utilisateur
║ ➤ .antilink
║ ➤ .antibadword
║ ➤ .clear
║ ➤ .tag <message>
║ ➤ .tagall
║ ➤ .tagnotadmin
║ ➤ .hidetag <message>
║ ➤ .chatbot
║ ➤ .resetlink
║ ➤ .antitag <on/off>
║ ➤ .welcome <on/off>
║ ➤ .goodbye <on/off>
║ ➤ .setgdesc <description>
║ ➤ .setgname <nouveau nom>
║ ➤ .setgpp (répondre à une image)
╚═══════════════════╝

╔═══════════════════╗
🔒 *Commandes Owner*:
║ ➤ .mode <public/private>
║ ➤ .clearsession
║ ➤ .antidelete
║ ➤ .cleartmp
║ ➤ .update
║ ➤ .settings
║ ➤ .setpp <répondre à une image>
║ ➤ .autoreact <on/off>
║ ➤ .autostatus <on/off>
║ ➤ .autostatus react <on/off>
║ ➤ .autotyping <on/off>
║ ➤ .autoread <on/off>
║ ➤ .anticall <on/off>
║ ➤ .pmblocker <on/off/status>
║ ➤ .pmblocker setmsg <texte>
║ ➤ .setmention <répondre au msg>
║ ➤ .mention <on/off>
╚═══════════════════╝

╔═══════════════════╗
🎨 *Images/Stickers*:
║ ➤ .blur <image>
║ ➤ .simage <sticker>
║ ➤ .sticker <image>
║ ➤ .removebg
║ ➤ .remini
║ ➤ .crop <image>
║ ➤ .tgsticker <lien>
║ ➤ .meme
║ ➤ .take <nom_pack> 
║ ➤ .emojimix <emj1>+<emj2>
║ ➤ .igs <lien_insta>
║ ➤ .igsc <lien_insta>
╚═══════════════════╝  

╔═══════════════════╗
🖼️ *Commandes Pies*:
║ ➤ .pies <pays>
║ ➤ .china 
║ ➤ .indonesia 
║ ➤ .japan 
║ ➤ .korea 
║ ➤ .hijab
╚═══════════════════╝

╔═══════════════════╗
🎮 *Jeux*:
║ ➤ .tictactoe @utilisateur
║ ➤ .hangman
║ ➤ .guess <lettre>
║ ➤ .trivia
║ ➤ .answer <réponse>
║ ➤ .truth
║ ➤ .dare
╚═══════════════════╝

╔═══════════════════╗
🤖 *IA*:
║ ➤ .gpt <question>
║ ➤ .gemini <question>
║ ➤ .imagine <prompt>
║ ➤ .flux <prompt>
║ ➤ .sora <prompt>
╚═══════════════════╝

╔═══════════════════╗
🎯 *Fun*:
║ ➤ .compliment @utilisateur
║ ➤ .insult @utilisateur
║ ➤ .flirt 
║ ➤ .shayari
║ ➤ .goodnight
║ ➤ .roseday
║ ➤ .character @utilisateur
║ ➤ .wasted @utilisateur
║ ➤ .ship @utilisateur
║ ➤ .simp @utilisateur
║ ➤ .stupid @utilisateur [texte]
╚═══════════════════╝

╔═══════════════════╗
🔤 *Éditeur de Texte*:
║ ➤ .metallic <texte>
║ ➤ .ice <texte>
║ ➤ .snow <texte>
║ ➤ .impressive <texte>
║ ➤ .matrix <texte>
║ ➤ .light <texte>
║ ➤ .neon <texte>
║ ➤ .devil <texte>
║ ➤ .purple <texte>
║ ➤ .thunder <texte>
║ ➤ .leaves <texte>
║ ➤ .1917 <texte>
║ ➤ .arena <texte>
║ ➤ .hacker <texte>
║ ➤ .sand <texte>
║ ➤ .blackpink <texte>
║ ➤ .glitch <texte>
║ ➤ .fire <texte>
╚═══════════════════╝

╔═══════════════════╗
📥 *Téléchargeur*:
║ ➤ .play <musique>
║ ➤ .song <musique>
║ ➤ .spotify <recherche>
║ ➤ .instagram <lien>
║ ➤ .facebook <lien>
║ ➤ .tiktok <lien>
║ ➤ .video <musique>
║ ➤ .ytmp4 <lien>
╚═══════════════════╝

╔═══════════════════╗
🧩 *DIVERS*:
║ ➤ .heart
║ ➤ .horny
║ ➤ .circle
║ ➤ .lgbt
║ ➤ .lolice
║ ➤ .its-so-stupid
║ ➤ .namecard 
║ ➤ .oogway
║ ➤ .tweet
║ ➤ .ytcomment 
║ ➤ .comrade 
║ ➤ .gay 
║ ➤ .glass 
║ ➤ .jail 
║ ➤ .passed 
║ ➤ .triggered
╚═══════════════════╝

╔═══════════════════╗
🖼️ *ANIME*:
║ ➤ .nom 
║ ➤ .poke 
║ ➤ .cry 
║ ➤ .kiss 
║ ➤ .pat 
║ ➤ .hug 
║ ➤ .wink 
║ ➤ .facepalm 
╚═══════════════════╝

╔═══════════════════╗
💻 *Github :*
║ ➤ .git
║ ➤ .github
║ ➤ .sc
║ ➤ .script
║ ➤ .repo
╚═══════════════════╝

*Bot actif et prêt !*`;

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363161513685998@newsletter',
                        newsletterName: 'Knight Bot',
                        serverMessageId: -1
                    }
                }
            },{ quoted: message });
        } else {
            console.error('Bot image not found at:', imagePath);
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363161513685998@newsletter',
                        newsletterName: 'Knight Bot',
                        serverMessageId: -1
                    } 
                }
            });
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

module.exports = helpCommand;
