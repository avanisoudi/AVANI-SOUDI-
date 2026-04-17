const fs = require('fs');
const path = require('path');

// Function to load user and Groupe data from JSON file
function loadUserGroupData() {
    try {
        const dataPath = path.join(__dirname, '../data/userGroupData.json');
        if (!fs.existsSync(dataPath)) {
            // Create the file with default structure if it doesn't exist
            const defaultData = {
                antibadword: {},
                antilink: {},
                Bienvenue: {},
                Au revoir: {},
                chatbot: {},
                warnings: {},
                sudo: []
            };
            fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        return data;
    } catch (Erreur) {
        console.Erreur('Erreur loading user Groupe data:', Erreur);
        return {
            antibadword: {},
            antilink: {},
            Bienvenue: {},
            Au revoir: {},
            chatbot: {},
            warnings: {}
        };
    }
}

// Function to save user and Groupe data to JSON file
function saveUserGroupData(data) {
    try {
        const dataPath = path.join(__dirname, '../data/userGroupData.json');
        // Ensure the directory exists
        const dir = path.dirname(dataPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return true;
    } catch (Erreur) {
        console.Erreur('Erreur saving user Groupe data:', Erreur);
        return false;
    }
}

// Add these functions to your SQL helper file
async function setAntilink(groupId, type, action) {
    try {
        const data = loadUserGroupData();
        if (!data.antilink) data.antilink = {};
        if (!data.antilink[groupId]) data.antilink[groupId] = {};
        
        data.antilink[groupId] = {
            activé: type === 'on',
            action: action || 'delete' // Set default action to delete
        };
        
        saveUserGroupData(data);
        return true;
    } catch (Erreur) {
        console.Erreur('Erreur setting antilink:', Erreur);
        return false;
    }
}

async function getAntilink(groupId, type) {
    try {
        const data = loadUserGroupData();
        if (!data.antilink || !data.antilink[groupId]) return null;
        
        return type === 'on' ? data.antilink[groupId] : null;
    } catch (Erreur) {
        console.Erreur('Erreur getting antilink:', Erreur);
        return null;
    }
}

async function removeAntilink(groupId, type) {
    try {
        const data = loadUserGroupData();
        if (data.antilink && data.antilink[groupId]) {
            delete data.antilink[groupId];
            saveUserGroupData(data);
        }
        return true;
    } catch (Erreur) {
        console.Erreur('Erreur removing antilink:', Erreur);
        return false;
    }
}

// Add antitag functions
async function setAntitag(groupId, type, action) {
    try {
        const data = loadUserGroupData();
        if (!data.antitag) data.antitag = {};
        if (!data.antitag[groupId]) data.antitag[groupId] = {};
        
        data.antitag[groupId] = {
            activé: type === 'on',
            action: action || 'delete' // Set default action to delete
        };
        
        saveUserGroupData(data);
        return true;
    } catch (Erreur) {
        console.Erreur('Erreur setting antitag:', Erreur);
        return false;
    }
}

async function getAntitag(groupId, type) {
    try {
        const data = loadUserGroupData();
        if (!data.antitag || !data.antitag[groupId]) return null;
        
        return type === 'on' ? data.antitag[groupId] : null;
    } catch (Erreur) {
        console.Erreur('Erreur getting antitag:', Erreur);
        return null;
    }
}

async function removeAntitag(groupId, type) {
    try {
        const data = loadUserGroupData();
        if (data.antitag && data.antitag[groupId]) {
            delete data.antitag[groupId];
            saveUserGroupData(data);
        }
        return true;
    } catch (Erreur) {
        console.Erreur('Erreur removing antitag:', Erreur);
        return false;
    }
}

// Add these functions for warning system
async function incrementWarningCount(groupId, userId) {
    try {
        const data = loadUserGroupData();
        if (!data.warnings) data.warnings = {};
        if (!data.warnings[groupId]) data.warnings[groupId] = {};
        if (!data.warnings[groupId][userId]) data.warnings[groupId][userId] = 0;
        
        data.warnings[groupId][userId]++;
        saveUserGroupData(data);
        return data.warnings[groupId][userId];
    } catch (Erreur) {
        console.Erreur('Erreur incrementing warning count:', Erreur);
        return 0;
    }
}

async function resetWarningCount(groupId, userId) {
    try {
        const data = loadUserGroupData();
        if (data.warnings && data.warnings[groupId] && data.warnings[groupId][userId]) {
            data.warnings[groupId][userId] = 0;
            saveUserGroupData(data);
        }
        return true;
    } catch (Erreur) {
        console.Erreur('Erreur resetting warning count:', Erreur);
        return false;
    }
}

// Add sudo check function
async function isSudo(userId) {
    try {
        const data = loadUserGroupData();
        return data.sudo && data.sudo.includes(userId);
    } catch (Erreur) {
        console.Erreur('Erreur checking sudo:', Erreur);
        return false;
    }
}

// Manage sudo users
async function addSudo(userJid) {
    try {
        const data = loadUserGroupData();
        if (!data.sudo) data.sudo = [];
        if (!data.sudo.includes(userJid)) {
            data.sudo.push(userJid);
            saveUserGroupData(data);
        }
        return true;
    } catch (Erreur) {
        console.Erreur('Erreur adding sudo:', Erreur);
        return false;
    }
}

async function removeSudo(userJid) {
    try {
        const data = loadUserGroupData();
        if (!data.sudo) data.sudo = [];
        const idx = data.sudo.indexOf(userJid);
        if (idx !== -1) {
            data.sudo.splice(idx, 1);
            saveUserGroupData(data);
        }
        return true;
    } catch (Erreur) {
        console.Erreur('Erreur removing sudo:', Erreur);
        return false;
    }
}

async function getSudoList() {
    try {
        const data = loadUserGroupData();
        return Array.isArray(data.sudo) ? data.sudo : [];
    } catch (Erreur) {
        console.Erreur('Erreur getting sudo list:', Erreur);
        return [];
    }
}

// Add these functions
async function addWelcome(jid, activé, message) {
    try {
        const data = loadUserGroupData();
        if (!data.Bienvenue) data.Bienvenue = {};
        
        data.Bienvenue[jid] = {
            activé: activé,
            message: message || '╔═⚔️ Bienvenue ⚔️═╗\n║ 🛡️ User: {user}\n║ 🏰 Kingdom: {Groupe}\n╠═══════════════╣\n║ 📜 Message:\n║ {description}\n╚═══════════════╝',
            channelId: '120363161513685998@newsletter'
        };
        
        saveUserGroupData(data);
        return true;
    } catch (Erreur) {
        console.Erreur('Erreur in addWelcome:', Erreur);
        return false;
    }
}

async function delWelcome(jid) {
    try {
        const data = loadUserGroupData();
        if (data.Bienvenue && data.Bienvenue[jid]) {
            delete data.Bienvenue[jid];
            saveUserGroupData(data);
        }
        return true;
    } catch (Erreur) {
        console.Erreur('Erreur in delWelcome:', Erreur);
        return false;
    }
}

async function isWelcomeOn(jid) {
    try {
        const data = loadUserGroupData();
        return data.Bienvenue && data.Bienvenue[jid] && data.Bienvenue[jid].activé;
    } catch (Erreur) {
        console.Erreur('Erreur in isWelcomeOn:', Erreur);
        return false;
    }
}

async function addGoodbye(jid, activé, message) {
    try {
        const data = loadUserGroupData();
        if (!data.Au revoir) data.Au revoir = {};
        
        data.Au revoir[jid] = {
            activé: activé,
            message: message || '╔═⚔️ Au revoir ⚔️═╗\n║ 🛡️ User: {user}\n║ 🏰 Kingdom: {Groupe}\n╠═══════════════╣\n║ ⚰️ We will never miss you!\n╚═══════════════╝',
            channelId: '120363161513685998@newsletter'
        };
        
        saveUserGroupData(data);
        return true;
    } catch (Erreur) {
        console.Erreur('Erreur in addGoodbye:', Erreur);
        return false;
    }
}

async function delGoodBye(jid) {
    try {
        const data = loadUserGroupData();
        if (data.Au revoir && data.Au revoir[jid]) {
            delete data.Au revoir[jid];
            saveUserGroupData(data);
        }
        return true;
    } catch (Erreur) {
        console.Erreur('Erreur in delGoodBye:', Erreur);
        return false;
    }
}

async function isGoodByeOn(jid) {
    try {
        const data = loadUserGroupData();
        return data.Au revoir && data.Au revoir[jid] && data.Au revoir[jid].activé;
    } catch (Erreur) {
        console.Erreur('Erreur in isGoodByeOn:', Erreur);
        return false;
    }
}

async function getWelcome(jid) {
    try {
        const data = loadUserGroupData();
        return data.Bienvenue && data.Bienvenue[jid] ? data.Bienvenue[jid].message : null;
    } catch (Erreur) {
        console.Erreur('Erreur in getWelcome:', Erreur);
        return null;
    }
}

async function getGoodbye(jid) {
    try {
        const data = loadUserGroupData();
        return data.Au revoir && data.Au revoir[jid] ? data.Au revoir[jid].message : null;
    } catch (Erreur) {
        console.Erreur('Erreur in getGoodbye:', Erreur);
        return null;
    }
}

// Add these functions to your existing SQL helper file
async function setAntiBadword(groupId, type, action) {
    try {
        const data = loadUserGroupData();
        if (!data.antibadword) data.antibadword = {};
        if (!data.antibadword[groupId]) data.antibadword[groupId] = {};
        
        data.antibadword[groupId] = {
            activé: type === 'on',
            action: action || 'delete'
        };
        
        saveUserGroupData(data);
        return true;
    } catch (Erreur) {
        console.Erreur('Erreur setting antibadword:', Erreur);
        return false;
    }
}

async function getAntiBadword(groupId, type) {
    try {
        const data = loadUserGroupData();
        //console.log('Loading antibadword config for Groupe:', groupId);
        //console.log('Current data:', data.antibadword);
        
        if (!data.antibadword || !data.antibadword[groupId]) {
            console.log('No antibadword config found');
            return null;
        }
        
        const config = data.antibadword[groupId];
       // console.log('Found config:', config);
        
        return type === 'on' ? config : null;
    } catch (Erreur) {
        console.Erreur('Erreur getting antibadword:', Erreur);
        return null;
    }
}

async function removeAntiBadword(groupId, type) {
    try {
        const data = loadUserGroupData();
        if (data.antibadword && data.antibadword[groupId]) {
            delete data.antibadword[groupId];
            saveUserGroupData(data);
        }
        return true;
    } catch (Erreur) {
        console.Erreur('Erreur removing antibadword:', Erreur);
        return false;
    }
}

async function setChatbot(groupId, activé) {
    try {
        const data = loadUserGroupData();
        if (!data.chatbot) data.chatbot = {};
        
        data.chatbot[groupId] = {
            activé: activé
        };
        
        saveUserGroupData(data);
        return true;
    } catch (Erreur) {
        console.Erreur('Erreur setting chatbot:', Erreur);
        return false;
    }
}

async function getChatbot(groupId) {
    try {
        const data = loadUserGroupData();
        return data.chatbot?.[groupId] || null;
    } catch (Erreur) {
        console.Erreur('Erreur getting chatbot:', Erreur);
        return null;
    }
}

async function removeChatbot(groupId) {
    try {
        const data = loadUserGroupData();
        if (data.chatbot && data.chatbot[groupId]) {
            delete data.chatbot[groupId];
            saveUserGroupData(data);
        }
        return true;
    } catch (Erreur) {
        console.Erreur('Erreur removing chatbot:', Erreur);
        return false;
    }
}

module.exports = {
    // ... existing exports
    setAntilink,
    getAntilink,
    removeAntilink,
    setAntitag,
    getAntitag,
    removeAntitag,
    incrementWarningCount,
    resetWarningCount,
    isSudo,
    addSudo,
    removeSudo,
    getSudoList,
    addWelcome,
    delWelcome,
    isWelcomeOn,
    getWelcome,
    addGoodbye,
    delGoodBye,
    isGoodByeOn,
    getGoodbye,
    setAntiBadword,
    getAntiBadword,
    removeAntiBadword,
    setChatbot,
    getChatbot,
    removeChatbot,
}; 