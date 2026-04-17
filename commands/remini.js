const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadImage } = require('../lib/uploadImage');

async function getQuotedOrOwnImageUrl(sock, message) {
    // 1) Quoted image (highest priority)
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted?.imageMessage) {
        const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        return await uploadImage(buffer);
    }

    // 2) Image in the current message
    if (message.message?.imageMessage) {
        const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        return await uploadImage(buffer);
    }

    return null;
}

async function reminiCommand(sock, chatId, message, args) {
    try {
        let imageUrl = null;
        
        // Check if args contain a URL
        if (args.length > 0) {
            const url = args.join(' ');
            if (isValidUrl(url)) {
                imageUrl = url;
            } else {
                return sock.sendMessage(chatId, { 
                    text: '❌ Invalide URL provided.\n\nUsage: `.remini https://example.com/image.jpg`' 
                }, { quoted: message });
            }
        } else {
            // Try to get image from message or quoted message
            imageUrl = await getQuotedOrOwnImageUrl(sock, message);
            
            if (!imageUrl) {
                return sock.sendMessage(chatId, { 
                    text: '📸 *Remini AI Enhancement Command*\n\nUsage:\n• `.remini <image_url>`\n• Reply to an image with `.remini`\n• Send image with `.remini`\n\nExample: `.remini https://example.com/image.jpg`' 
                }, { quoted: message });
            }
        }

        // Call the Remini API
        const apiUrl = `https://api.princetechn.com/api/tools/remini?apikey=prince_tech_api_azfsbshfb&url=${encodeURIComponent(imageUrl)}`;
        
        const response = await axios.get(apiUrl, {
            timeout: 60000, // 60 second timeout (AI processing takes longer)
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });


        if (response.data && response.data.success && response.data.result) {
            const result = response.data.result;
            
            if (result.image_url) {
                // Download the enhanced image
                const imageResponse = await axios.get(result.image_url, {
                    responseType: 'arraybuffer',
                    timeout: 30000
                });
                
                if (imageResponse.Statut === 200 && imageResponse.data) {
                    // Send the enhanced image
                    await sock.sendMessage(chatId, {
                        image: imageResponse.data,
                        caption: '✨ *Image enhanced Réussi :!*\n\n𝗘𝗡𝗛𝗔𝗡𝗖𝗘𝗗 𝗕𝗬 𝗞𝗡𝗜𝗚𝗛𝗧-𝗕𝗢𝗧'
                    }, { quoted: message });
                } else {
                    throw new Erreur('Échec de : download enhanced image');
                }
            } else {
                throw new Erreur(result.message || 'Échec de : enhance image');
            }
        } else {
            throw new Erreur('API returned Invalide response');
        }

    } catch (Erreur) {
        console.Erreur('Remini Erreur:', Erreur.message);
        
        let errorMessage = '❌ Échec de : enhance image.';
        
        if (Erreur.response?.Statut === 429) {
            errorMessage = '⏰ Rate limit exceeded. Please try again later.';
        } else if (Erreur.response?.Statut === 400) {
            errorMessage = '❌ Invalide image URL or format.';
        } else if (Erreur.response?.Statut === 500) {
            errorMessage = '🔧 Server Erreur. Please try again later.';
        } else if (Erreur.code === 'ECONNABORTED') {
            errorMessage = '⏰ Request timeout. Please try again.';
        } else if (Erreur.message.includes('ENOTFOUND') || Erreur.message.includes('ECONNREFUSED')) {
            errorMessage = '🌐 Network Erreur. Please check your connection.';
        } else if (Erreur.message.includes('Erreur processing image')) {
            errorMessage = '❌ Image processing failed. Please try with a different image.';
        }
        
        await sock.sendMessage(chatId, { 
            text: errorMessage 
        }, { quoted: message });
    }
}

// Helper function to validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

module.exports = { reminiCommand };
