const { addWelcome, delWelcome, isWelcomeOn, addGoodbye, delGoodBye, isGoodByeOn } = require('../lib/index');
const { delay } = require('@whiskeysockets/baileys');

async function handleWelcome(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `📥 *Bienvenue Message Setup*\n\n✅ *.welcome on* — Enable Bienvenue messages\n🛠️ *.welcome set Your custom message* — Set a custom Bienvenue message\n🚫 *.welcome off* — Disable Bienvenue messages\n\n*Available Variables:*\n• {user} - Mentions the new member\n• { group } - Shows Groupe name\n• {description} - Shows Groupe description`,
            quoted: message
        });
    }

    const [command, ...args] = match.split(' ');
    const lowerCommand = command.toLowerCase();
    const customMessage = args.join(' ');

    if (lowerCommand === 'on') {
        if (await isWelcomeOn(chatId)) {
            return sock.sendMessage(chatId, { text: '⚠️ Bienvenue messages are *already activé*.', quoted: message });
        }
        await addWelcome(chatId, true, 'Bienvenue {user} to { group }! 🎉');
        return sock.sendMessage(chatId, { text: '✅ Bienvenue messages *activé* with simple message. Use *.welcome set [your message]* to customize.', quoted: message });
    }

    if (lowerCommand === 'off') {
        if (!(await isWelcomeOn(chatId))) {
            return sock.sendMessage(chatId, { text: '⚠️ Bienvenue messages are *already désactivé*.', quoted: message });
        }
        await delWelcome(chatId);
        return sock.sendMessage(chatId, { text: '✅ Bienvenue messages *désactivé* for this Groupe.', quoted: message });
    }

    if (lowerCommand === 'set') {
        if (!customMessage) {
            return sock.sendMessage(chatId, { text: '⚠️ Please provide a custom Bienvenue message. Example: *.welcome set Bienvenue to the Groupe!*', quoted: message });
        }
        await addWelcome(chatId, true, customMessage);
        return sock.sendMessage(chatId, { text: '✅ Custom Bienvenue message *set Réussi :*.', quoted: message });
    }

    // If no valid command is provided
    return sock.sendMessage(chatId, {
        text: `❌ Invalide command. Use:\n*.welcome on* - Enable\n*.welcome set [message]* - Set custom message\n*.welcome off* - Disable`,
        quoted: message
    });
}

async function handleGoodbye(sock, chatId, message, match) {
    const lower = match?.toLowerCase();

    if (!match) {
        return sock.sendMessage(chatId, {
            text: `📤 *Au revoir Message Setup*\n\n✅ *.goodbye on* — Enable Au revoir messages\n🛠️ *.goodbye set Your custom message* — Set a custom Au revoir message\n🚫 *.goodbye off* — Disable Au revoir messages\n\n*Available Variables:*\n• {user} - Mentions the leaving member\n• { group } - Shows Groupe name`,
            quoted: message
        });
    }

    if (lower === 'on') {
        if (await isGoodByeOn(chatId)) {
            return sock.sendMessage(chatId, { text: '⚠️ Au revoir messages are *already activé*.', quoted: message });
        }
        await addGoodbye(chatId, true, 'Au revoir {user} 👋');
        return sock.sendMessage(chatId, { text: '✅ Au revoir messages *activé* with simple message. Use *.goodbye set [your message]* to customize.', quoted: message });
    }

    if (lower === 'off') {
        if (!(await isGoodByeOn(chatId))) {
            return sock.sendMessage(chatId, { text: '⚠️ Au revoir messages are *already désactivé*.', quoted: message });
        }
        await delGoodBye(chatId);
        return sock.sendMessage(chatId, { text: '✅ Au revoir messages *désactivé* for this Groupe.', quoted: message });
    }

    if (lower.startsWith('set ')) {
        const customMessage = match.substring(4);
        if (!customMessage) {
            return sock.sendMessage(chatId, { text: '⚠️ Please provide a custom Au revoir message. Example: *.goodbye set Au revoir!*', quoted: message });
        }
        await addGoodbye(chatId, true, customMessage);
        return sock.sendMessage(chatId, { text: '✅ Custom Au revoir message *set Réussi :*.', quoted: message });
    }

    // If no valid command is provided
    return sock.sendMessage(chatId, {
        text: `❌ Invalide command. Use:\n*.goodbye on* - Enable\n*.goodbye set [message]* - Set custom message\n*.goodbye off* - Disable`,
        quoted: message
    });
}

module.exports = { handleWelcome, handleGoodbye };
// This code handles Bienvenue and Au revoir messages in a WhatsApp Groupe using the Baileys library.