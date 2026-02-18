const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const router = express.Router();
const pino = require('pino');
const cheerio = require('cheerio');
const os = require('os');
const moment = require('moment-timezone');
const Jimp = require('jimp');
const crypto = require('crypto');
const axios = require('axios');

// MongoDB Database
const mongoDB = require('./lib/mongoDB');
const id_db = require('./lib/id_db');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser,
    getContentType,
    proto,
    prepareWAMessageMedia,
    generateWAMessageFromContent
} = require('@whiskeysockets/baileys');

// Default Config
let config = {
    WELCOME: 'true',
    AUTO_VIEW_STATUS: 'true',
    AUTO_VOICE: 'true',
    AUTO_LIKE_STATUS: 'true',
    AUTO_RECORDING: 'true',
    HEROKU_APP_URL: 'https://sila-md-mini-bot-hgpz.onrender.com/',
    AUTO_LIKE_EMOJI: ['🥹', '👍', '😍', '💗', '🎈', '🎉', '🥳', '😎', '🚀', '🔥'],
    PREFIX: '.',
    MAX_RETRIES: 3,
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/IdGNaKt80DEBqirc2ek4ks',
    ADMIN_LIST_PATH: './lib/admin.json',
    RCD_IMAGE_PATH: 'https://files.catbox.moe/jwmx1j.jpg',
    NEWSLETTER_JID: '120363422610520277@newsletter',
    NEWSLETTER_MESSAGE_ID: '428',
    OTP_EXPIRY: 300000,
    OWNER_NUMBER: '255612491554',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbBPxQTJUM2WCZLB6j28'
};

// Active sockets map
const activeSockets = new Map();
const socketCreationTime = new Map();
const SESSION_BASE_PATH = './session';
const otpStore = new Map();

// Auto Replies Configuration
const autoReplies = {
    'hi': 'Hello! 👋 How can I help you today?',
    'mambo': 'Poa sana! 👋 Nikusaidie kuhusu?',
    'hey': 'Hey there! 😊 Use .menu to see all available commands.',
    'vip': 'Hello VIP! 👑 How can I assist you?',
    'mkuu': 'Hey mkuu! 👋 Nikusaidie kuhusu?',
    'boss': 'Yes boss! 👑 How can I help you?',
    'habari': 'Nzuri sana! 👋 Habari yako?',
    'hello': 'Hi there! 😊 Use .menu to see all available commands.',
    'bot': 'Yes, I am SILA MD MINI! 🤖 How can I assist you?',
    'menu': 'Type .menu to see all commands! 📜',
    'owner': 'Contact owner using .owner command 👑',
    'thanks': 'You\'re welcome! 😊',
    'thank you': 'Anytime! Let me know if you need help 🤖'
};

// Initialize MongoDB and load config
(async () => {
    try {
        await mongoDB.connectToMongoDB();
        await mongoDB.initializeSettings();
        
        // Load settings into config
        const settings = await mongoDB.getAllSettings();
        config = { ...config, ...settings };
        
        console.log('✅ MongoDB initialized successfully');
        console.log('📊 Config loaded from database');
        
        // Start auto-reconnect after 5 seconds
        setTimeout(() => {
            autoReconnectFromMongoDB();
        }, 5000);
    } catch (error) {
        console.error('❌ Failed to initialize MongoDB:', error);
    }
})();

// Ensure session directory exists
if (!fs.existsSync(SESSION_BASE_PATH)) {
    fs.mkdirSync(SESSION_BASE_PATH, { recursive: true });
}

// Safe file reading functions
function safeJSONParse(str, defaultValue = []) {
    try {
        if (!str || str.trim() === '') return defaultValue;
        return JSON.parse(str);
    } catch (error) {
        console.log('❌ JSON parse error:', error.message);
        return defaultValue;
    }
}

function safeReadFile(filePath, defaultValue = '[]') {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, defaultValue);
            return defaultValue;
        }
        const content = fs.readFileSync(filePath, 'utf8');
        return content || defaultValue;
    } catch (error) {
        console.log('❌ File read error:', error.message);
        return defaultValue;
    }
}

function loadAdmins() {
    try {
        if (fs.existsSync(config.ADMIN_LIST_PATH)) {
            const content = safeReadFile(config.ADMIN_LIST_PATH, '[]');
            return safeJSONParse(content, []);
        }
        return config.ADMIN_LIST || [];
    } catch (error) {
        console.error('Failed to load admin list:', error);
        return [];
    }
}

function formatMessage(title, content, footer) {
    return `*${title}*\n\n${content}\n\n> *${footer}*`;
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getSriLankaTimestamp() {
    return moment().tz('Asia/Colombo').format('YYYY-MM-DD HH:mm:ss');
}

async function cleanDuplicateFiles(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        
        const sessionDir = path.join(SESSION_BASE_PATH);
        if (!fs.existsSync(sessionDir)) return;
        
        const files = fs.readdirSync(sessionDir);
        const sessionFiles = files.filter(file => 
            file.includes(sanitizedNumber) && file.endsWith('.json')
        );
        
        if (sessionFiles.length > 1) {
            const sortedFiles = sessionFiles.sort().reverse();
            for (let i = 1; i < sortedFiles.length; i++) {
                fs.unlinkSync(path.join(sessionDir, sortedFiles[i]));
                console.log(`🗑️ Deleted duplicate: ${sortedFiles[i]}`);
            }
        }
    } catch (error) {
        console.log(`⚠️ Local clean for ${number}: ${error.message}`);
    }
}

async function joinGroup(socket) {
    let retries = config.MAX_RETRIES;
    const inviteCodeMatch = config.GROUP_INVITE_LINK.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/);
    if (!inviteCodeMatch) {
        console.error('Invalid group invite link format');
        return { status: 'failed', error: 'Invalid group invite link' };
    }
    const inviteCode = inviteCodeMatch[1];

    while (retries > 0) {
        try {
            const response = await socket.groupAcceptInvite(inviteCode);
            if (response?.gid) {
                console.log(`✅ Successfully joined group with ID: ${response.gid}`);
                return { status: 'success', gid: response.gid };
            }
            throw new Error('No group ID in response');
        } catch (error) {
            retries--;
            let errorMessage = error.message || 'Unknown error';
            if (error.message.includes('not-authorized')) {
                errorMessage = 'Bot is not authorized to join (possibly banned)';
            } else if (error.message.includes('conflict')) {
                errorMessage = 'Bot is already a member of the group';
            } else if (error.message.includes('gone')) {
                errorMessage = 'Group invite link is invalid or expired';
            }
            if (retries === 0) {
                return { status: 'failed', error: errorMessage };
            }
            await delay(2000 * (config.MAX_RETRIES - retries));
        }
    }
    return { status: 'failed', error: 'Max retries reached' };
}

async function sendAdminConnectMessage(socket, number, groupResult) {
    const admins = loadAdmins();
    const caption = `*╭━━━〔 🐢 SILA MD 🐢 〕━━━┈⊷*
*┃🐢│ BOT CONNECTED SUCCESSFULLY!*
*┃🐢│ USER :❯ +${number}*
*┃🐢│ STATUS :❯ ONLINE AND READY!*
*╰━━━━━━━━━━━━━━━┈⊷*`;

    for (const admin of admins) {
        try {
            await socket.sendMessage(
                `${admin}@s.whatsapp.net`,
                {
                    image: { url: config.RCD_IMAGE_PATH },
                    caption
                }
            );
        } catch (error) {
            console.error(`Failed to send connect message to admin ${admin}:`, error);
        }
    }
}

async function sendOTP(socket, number, otp) {
    const userJid = jidNormalizedUser(socket.user.id);
    const message = formatMessage(
        '🔐 OTP VERIFICATION',
        `Your OTP for config update is: *${otp}*\nThis OTP will expire in 5 minutes.`,
        '*🐢 SILA MD MINI BOT 🐢*'
    );

    try {
        await socket.sendMessage(userJid, { text: message });
        console.log(`OTP ${otp} sent to ${number}`);
    } catch (error) {
        console.error(`Failed to send OTP to ${number}:`, error);
        throw error;
    }
}

// Auto Bio Setup
async function updateAboutStatus(socket) {
    const bioMessages = [
        "🐢 SILA-MD-MINI | 🤖 AI Assistant",
        "🌟 Powered by SILA TECH | 🚀 Fast & Reliable",
        "💫 SILA-MD-MINI Bot | Always Active!",
        "👑 SILA TECH | Mini WhatsApp Bot"
    ];
    
    const randomBio = bioMessages[Math.floor(Math.random() * bioMessages.length)];
    
    try {
        await socket.updateProfileStatus(randomBio);
        console.log(`✅ Bio updated: ${randomBio}`);
    } catch (error) {
        console.error('❌ Failed to update bio:', error);
    }
}

async function updateStoryStatus(socket) {
    const statusMessage = `*🐢 SILA MD MINI BOT 🐢*\nConnected at: ${getSriLankaTimestamp()}`;
    try {
        await socket.sendMessage('status@broadcast', { text: statusMessage });
        console.log(`Posted story status: ${statusMessage}`);
    } catch (error) {
        console.error('Failed to post story status:', error);
    }
}

function setupNewsletterHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message?.key || message.key.remoteJid !== config.NEWSLETTER_JID) return;

        try {
            const emojis = ['🐢', '❤️', '🔥', '😀', '👍'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            const messageId = message.newsletterServerId;

            if (!messageId) {
                return;
            }

            let retries = config.MAX_RETRIES;
            while (retries > 0) {
                try {
                    await socket.newsletterReactMessage(
                        config.NEWSLETTER_JID,
                        messageId.toString(),
                        randomEmoji
                    );
                    console.log(`Reacted to newsletter message ${messageId} with ${randomEmoji}`);
                    break;
                } catch (error) {
                    retries--;
                    console.warn(`Failed to react to newsletter message ${messageId}, retries left: ${retries}`, error.message);
                    if (retries === 0) throw error;
                    await delay(2000 * (config.MAX_RETRIES - retries));
                }
            }
        } catch (error) {
            console.error('Newsletter reaction error:', error);
        }
    });
}

// Channel Handlers
async function setupChannelHandlers(socket) {
    const channelJids = [
        '120363422610520277@newsletter',
        '120363402325089913@newsletter'
    ];
    
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message?.key || !channelJids.includes(message.key.remoteJid)) return;

        try {
            const emojis = ['🐢', '❤️', '🔥', '👍'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            const messageId = message.newsletterServerId;

            if (!messageId) return;

            let retries = config.MAX_RETRIES;
            while (retries > 0) {
                try {
                    await socket.newsletterReactMessage(
                        message.key.remoteJid,
                        messageId.toString(),
                        randomEmoji
                    );
                    console.log(`🐢 Reacted to channel message ${messageId} with ${randomEmoji}`);
                    break;
                } catch (error) {
                    retries--;
                    if (retries === 0) throw error;
                    await delay(2000 * (config.MAX_RETRIES - retries));
                }
            }
        } catch (error) {
            console.error('Channel reaction error:', error);
        }
    });
}

async function setupStatusHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message?.key || message.key.remoteJid !== 'status@broadcast' || !message.key.participant || message.key.remoteJid === config.NEWSLETTER_JID) return;

        try {
            if (config.AUTO_RECORDING === 'true' && message.key.remoteJid) {
                await socket.sendPresenceUpdate("recording", message.key.remoteJid);
            }

            if (config.AUTO_VIEW_STATUS === 'true') {
                let retries = config.MAX_RETRIES;
                while (retries > 0) {
                    try {
                        await socket.readMessages([message.key]);
                        break;
                    } catch (error) {
                        retries--;
                        console.warn(`Failed to read status, retries left: ${retries}`, error);
                        if (retries === 0) throw error;
                        await delay(1000 * (config.MAX_RETRIES - retries));
                    }
                }
            }

            if (config.AUTO_LIKE_STATUS === 'true') {
                const randomEmoji = config.AUTO_LIKE_EMOJI[Math.floor(Math.random() * config.AUTO_LIKE_EMOJI.length)];
                let retries = config.MAX_RETRIES;
                while (retries > 0) {
                    try {
                        await socket.sendMessage(
                            message.key.remoteJid,
                            { react: { text: randomEmoji, key: message.key } },
                            { statusJidList: [message.key.participant] }
                        );
                        console.log(`Reacted to status with ${randomEmoji}`);
                        break;
                    } catch (error) {
                        retries--;
                        console.warn(`Failed to react to status, retries left: ${retries}`, error);
                        if (retries === 0) throw error;
                        await delay(1000 * (config.MAX_RETRIES - retries));
                    }
                }
            }
        } catch (error) {
            console.error('Status handler error:', error);
        }
    });
}

async function handleMessageRevocation(socket, number) {
    socket.ev.on('messages.delete', async ({ keys }) => {
        if (!keys || keys.length === 0) return;

        const messageKey = keys[0];
        const userJid = jidNormalizedUser(socket.user.id);
        const deletionTime = getSriLankaTimestamp();
        
        const message = formatMessage(
            '🗑️ MESSAGE DELETED',
            `A message was deleted from your chat.\n📋 From: ${messageKey.remoteJid}\n🍁 Deletion Time: ${deletionTime}`,
            'SILA MD MINI'
        );

        try {
            await socket.sendMessage(userJid, {
                image: { url: config.RCD_IMAGE_PATH },
                caption: message
            });
            console.log(`Notified ${number} about message deletion: ${messageKey.id}`);
        } catch (error) {
            console.error('Failed to send deletion notification:', error);
        }
    });
}

async function resize(image, width, height) {
    let oyy = await Jimp.read(image);
    let kiyomasa = await oyy.resize(width, height).getBufferAsync(Jimp.MIME_JPEG);
    return kiyomasa;
}

function capital(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const createSerial = (size) => {
    return crypto.randomBytes(size).toString('hex').slice(0, size);
}

// Load plugins
const plugins = new Map();
const pluginDir = path.join(__dirname, 'plugins');
if (fs.existsSync(pluginDir)) {
    fs.readdirSync(pluginDir).forEach(file => {
        if (file.endsWith('.js')) {
            try {
                const plugin = require(path.join(pluginDir, file));
                if (plugin.command) {
                    const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
                    cmds.forEach(cmd => {
                        plugins.set(cmd, plugin);
                    });
                }
            } catch (error) {
                console.log(`❌ Failed to load plugin ${file}:`, error.message);
            }
        }
    });
    console.log(`✅ Loaded ${plugins.size} plugins`);
}

// Auto Reply Handler
function setupAutoReplyHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const msg = messages[0];
            if (
                !msg.message ||
                msg.key.remoteJid === 'status@broadcast' ||
                msg.key.remoteJid === config.NEWSLETTER_JID
            )
                return;

            let text = '';
            if (msg.message.conversation) {
                text = msg.message.conversation.toLowerCase().trim();
            } else if (msg.message.extendedTextMessage?.text) {
                text = msg.message.extendedTextMessage.text.toLowerCase().trim();
            }

            if (!text) return;

            // Check for auto-reply triggers
            for (const [trigger, reply] of Object.entries(autoReplies)) {
                if (text === trigger.toLowerCase()) {
                    await socket.sendMessage(msg.key.remoteJid, { text: reply }, { quoted: msg });
                    console.log(`Auto-replied to "${trigger}"`);
                    break;
                }
            }
        } catch (err) {
            console.error('Auto-reply error:', err);
        }
    });
}

// Function to send button message
async function sendButtonMessage(socket, jid, buttonCmd, quotedMsg) {
    try {
        const buttons = buttonCmd.buttons.map(btn => ({
            buttonId: `${buttonCmd.command}:${btn.buttonId}`,
            buttonText: { displayText: btn.buttonText },
            type: btn.type || 1
        }));

        const buttonMessage = {
            text: buttonCmd.message,
            footer: buttonCmd.footer || '🐢 SILA MD MINI BOT 🐢',
            buttons: buttons,
            headerType: 1,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.NEWSLETTER_JID || '120363422610520277@newsletter',
                    newsletterName: '🐢 SILA MD MINI BOT 🐢',
                    serverMessageId: 143
                }
            }
        };

        if (buttonCmd.header) {
            buttonMessage.header = buttonCmd.header;
        }

        await socket.sendMessage(jid, buttonMessage, { quoted: quotedMsg });
    } catch (error) {
        console.error('Error sending button message:', error);
    }
}

// Setup Button Commands Handler
async function setupButtonCommands(socket) {
    const buttonCommands = await mongoDB.getAllButtonCommands();
    const buttonCommandsMap = new Map();
    
    buttonCommands.forEach(cmd => {
        if (cmd && cmd.command) {
            buttonCommandsMap.set(cmd.command.toLowerCase(), cmd);
        }
    });

    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

        let command = null;
        let args = [];
        let sender = msg.key.remoteJid;
        
        // Check for button response
        if (msg.message.buttonsResponseMessage) {
            const buttonId = msg.message.buttonsResponseMessage.selectedButtonId;
            if (buttonId) {
                const [cmd, ...buttonArgs] = buttonId.split(':');
                command = cmd;
                args = buttonArgs;
            }
        } else if (msg.message.conversation || msg.message.extendedTextMessage?.text) {
            const text = (msg.message.conversation || msg.message.extendedTextMessage.text || '').trim();
            command = text.toLowerCase();
        }

        if (!command) return;

        // Check if it's a button command
        const buttonCmd = buttonCommandsMap.get(command);
        if (buttonCmd) {
            await sendButtonMessage(socket, sender, buttonCmd, msg);
            return;
        }

        // Check for prefixed commands
        if (msg.message.conversation || msg.message.extendedTextMessage?.text) {
            const text = (msg.message.conversation || msg.message.extendedTextMessage.text || '').trim();
            if (text.startsWith(config.PREFIX)) {
                const parts = text.slice(config.PREFIX.length).trim().split(/\s+/);
                command = parts[0].toLowerCase();
                args = parts.slice(1);

                // Execute plugin
                if (plugins.has(command)) {
                    const plugin = plugins.get(command);
                    try {
                        await plugin.execute(socket, msg, args, number);
                    } catch (err) {
                        console.error(`❌ Plugin "${command}" error:`, err);
                        
                        await socket.sendMessage(
                            sender,
                            {
                                image: { url: config.RCD_IMAGE_PATH },
                                caption: formatMessage(
                                    '❌ ERROR',
                                    `*THERE IS SOME PROBLEM WITH ${command} COMMAND 😥*\n\n${err.message || err}\n\n*BUT IT WILL BE FIXED SOON 😃*`,
                                    '*🐢 SILA MD MINI BOT 🐢*'
                                ),
                                contextInfo: {
                                    forwardingScore: 999,
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: config.NEWSLETTER_JID,
                                        newsletterName: '🐢 SILA MD MINI BOT 🐢',
                                        serverMessageId: 143
                                    }
                                }
                            },
                            { quoted: msg }
                        );
                    }
                }
            }
        }
    });
}

// GROUP WELCOME
async function setupWelcomeHandlers(socket) {
  if (config.WELCOME === 'true') {
    socket.ev.on('group-participants.update', async (update) => {
      const { id: groupId, participants, action } = update;

      try {
        // NEW MEMBER
        if (action === 'add') {
          const metadata = await socket.groupMetadata(groupId);
          const groupName = metadata.subject;

          for (const user of participants) {
            const userName = user.split('@')[0];

            const welcomeText = `*╭━━━〔 🐢 SILA MD 🐢 〕━━━┈⊷*
*┃🐢│ GROUP NAME*
*┃🐢│ ${groupName}*

*MOST WELCOME MY DEAR 😍*\n*🐢 @${userName} 🐢*\n \n*THANK YOU FROM HEART 🥰 FOR JOINING OUR GROUP 😊*

*WE HAVE ONE REQUEST 🥺❤️*
*PLEASE READ THE GROUP RULES 😊 AND FOLLOW THEM OK 🥰*
*IF YOU TRY TO BREAK GROUP RULES THEN YOU WILL BE REMOVED 🥺 SO PLEASE DON'T SAY LATER THAT WE DIDN'T INFORM YOU OK 😕*
*╰━━━━━━━━━━━━━━━┈⊷*`;

            await socket.sendMessage(groupId, {
              image: { url: config.RCD_IMAGE_PATH },
              caption: welcomeText,
              mentions: [user],
              contextInfo: {
                mentionedJid: [user],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: config.NEWSLETTER_JID,
                  newsletterName: 'SILA MD MINI BOT',
                  serverMessageId: 143
                }
              }
            });
            await delay(1000);
          }
        }

        // MEMBER LEAVING
        if (action === 'remove') {
          const metadata = await socket.groupMetadata(groupId);
          const groupName = metadata.subject;

          for (const user of participants) {
            const userName = user.split('@')[0];

            const leftText = `*╭━━━〔 🐢 SILA MD 🐢 〕━━━┈⊷*
*ALLAH HAFIZ 🥺❤️*
@${userName}* G 🥺
*TAKE CARE OF YOURSELF AND STAY HAPPY 🥺❤️*
*IF YOU EVER FEEL LIKE COMING BACK 🥺 THEN COME BACK TO OUR GROUP ☺️❤️*
*╰━━━━━━━━━━━━━━━┈⊷*`;

            await socket.sendMessage(groupId, {
              image: { url: config.RCD_IMAGE_PATH },
              caption: leftText,
              mentions: [user],
              contextInfo: {
                mentionedJid: [user],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: config.NEWSLETTER_JID,
                  newsletterName: 'SILA MD MINI BOT',
                  serverMessageId: 143
                }
              }
            });
            await delay(1000);
          }
        }

      } catch (err) {
        console.error('Error sending welcome/left message:', err);
      }
    });
  }
}

function setupMessageHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid === config.NEWSLETTER_JID) return;

        if (config.AUTO_RECORDING === 'true') {
            try {
                await socket.sendPresenceUpdate('recording', msg.key.remoteJid);
            } catch (error) {
                console.error('Failed to set recording presence:', error);
            }
        }
    });
}

// Anti-link handler
function setupAntiLinkHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            try {
                const m = msg.message;
                const sender = msg.key.remoteJid;

                if (!m || !sender.endsWith('@g.us')) continue;

                const settings = await mongoDB.getAllSettings();
                const antilinkGroups = settings.ANTI_LINK || [];
                const isAntilinkOn = antilinkGroups.includes(sender);
                
                const body = m.conversation || m.extendedTextMessage?.text || '';

                const groupInviteRegex = /https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{22}/gi;
                if (isAntilinkOn && groupInviteRegex.test(body)) {
                    const groupMetadata = await socket.groupMetadata(sender);
                    const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
                    const isAdmin = groupAdmins.includes(msg.key.participant || msg.participant);

                    if (!isAdmin) {
                        await socket.sendMessage(sender, {
                            text: `🚫 WhatsApp group links are not allowed!`,
                            mentions: [msg.key.participant]
                        }, { quoted: msg });

                        await socket.sendMessage(sender, {
                            delete: {
                                remoteJid: sender,
                                fromMe: false,
                                id: msg.key.id,
                                participant: msg.key.participant
                            }
                        });
                    }
                }
            } catch (e) {
                console.error('Antilink Error:', e.message);
            }
        }
    });
}

// Restore session from MongoDB
async function restoreSession(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const creds = await mongoDB.getSession(sanitizedNumber);
        
        if (creds) {
            console.log(`✅ Session restored from MongoDB for ${sanitizedNumber}`);
            return creds;
        }
        return null;
    } catch (error) {
        console.log(`❌ MongoDB restore failed for ${number}: ${error.message}`);
        return null;
    }
}

// Load user config from MongoDB
async function loadUserConfig(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const settings = await mongoDB.getAllSettings();
        return { ...config, ...settings };
    } catch (error) {
        console.log(`❌ Config load failed, using default: ${error.message}`);
        return { ...config };
    }
}

function setupAutoRestart(socket, number) {
    socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== 401) {
            console.log(`Connection lost for ${number}, attempting to reconnect...`);
            await delay(10000);
            activeSockets.delete(number.replace(/[^0-9]/g, ''));
            socketCreationTime.delete(number.replace(/[^0-9]/g, ''));
            const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };
            await EmpirePair(number, mockRes);
        }
    });
}

// Auto reconnect from MongoDB
async function autoReconnectFromMongoDB() {
    try {
        const numbers = await mongoDB.getAllSessions();
        
        console.log(`✅ Found ${numbers.length} sessions for auto-reconnect from MongoDB`);

        for (const number of numbers) {
            if (number && !activeSockets.has(number)) {
                try {
                    console.log(`🔁 Attempting to reconnect: ${number}`);
                    const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };
                    await EmpirePair(number, mockRes);
                    console.log(`✅ Successfully reconnected: ${number}`);
                    await delay(3000);
                } catch (pairError) {
                    console.log(`❌ Failed to reconnect ${number}:`, pairError.message);
                }
            }
        }
    } catch (error) {
        console.log('❌ Auto-reconnect failed:', error.message);
    }
}

// Update number list in MongoDB
async function updateNumberListInMongoDB(newNumber) {
    try {
        const sanitizedNumber = newNumber.replace(/[^0-9]/g, '');
        // Numbers are tracked via sessions in MongoDB
        console.log(`✅ Session will be saved for ${sanitizedNumber}`);
    } catch (err) {
        console.log(`❌ Number update failed: ${err.message}`);
    }
}

async function EmpirePair(number, res) {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);

    await cleanDuplicateFiles(sanitizedNumber);
    
    // Restore session from MongoDB
    const restoredCreds = await restoreSession(sanitizedNumber);
    
    if (restoredCreds) {
        fs.ensureDirSync(sessionPath);
        fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(restoredCreds, null, 2));
        console.log(`✅ Successfully restored session for ${sanitizedNumber} from MongoDB`);
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'fatal' : 'debug' });

    try {
        const socket = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            printQRInTerminal: false,
            logger,
            browser: Browsers.macOS('Safari')
        });

        socketCreationTime.set(sanitizedNumber, Date.now());
        
        // Load user config
        const userConfig = await loadUserConfig(sanitizedNumber);
        config = { ...config, ...userConfig };
        
        // Setup all handlers
        await setupWelcomeHandlers(socket);
        await setupStatusHandlers(socket);
        await setupMessageHandlers(socket);
        await setupAutoRestart(socket, sanitizedNumber);
        await setupNewsletterHandlers(socket);
        await setupChannelHandlers(socket);
        await setupAutoReplyHandlers(socket);
        await setupAntiLinkHandlers(socket);
        await setupButtonCommands(socket); // Important: Button commands handler
        await handleMessageRevocation(socket, sanitizedNumber);
        
        if (!socket.authState.creds.registered) {
            let retries = config.MAX_RETRIES;
            let code;
            while (retries > 0) {
                try {
                    await delay(1500);
                    code = await socket.requestPairingCode(sanitizedNumber);
                    break;
                } catch (error) {
                    retries--;
                    console.warn(`Failed to request pairing code: ${retries}, error: ${error.message}`);
                    await delay(2000 * (config.MAX_RETRIES - retries));
                }
            }
            if (!res.headersSent) {
                res.send({ code });
            }
        }

        socket.ev.on('creds.update', async () => {
            await saveCreds();
            // Save to MongoDB
            const fileContent = await fs.readFile(path.join(sessionPath, 'creds.json'), 'utf8');
            const creds = JSON.parse(fileContent);
            await mongoDB.saveSession(sanitizedNumber, creds);
            console.log(`✅ Saved creds to MongoDB for ${sanitizedNumber}`);
        });

        socket.ev.on('connection.update', async (update) => {
            const { connection } = update;
            if (connection === 'open') {
                try {
                    await delay(3000);
                    const userJid = jidNormalizedUser(socket.user.id);

                    await updateAboutStatus(socket);
                    await updateStoryStatus(socket);

                    const groupResult = await joinGroup(socket);

                    try {
                        await socket.newsletterFollow(config.NEWSLETTER_JID);
                        await socket.sendMessage(config.NEWSLETTER_JID, { react: { text: '🐢', key: { id: config.NEWSLETTER_MESSAGE_ID } } });
                        console.log('✅ Auto-followed newsletter & reacted 🐢');
                    } catch (error) {
                        console.error('❌ Newsletter error:', error.message);
                    }

                    activeSockets.set(sanitizedNumber, socket);

                    const successMessage = `*╭━━━〔 🐢 SILA MD 🐢 〕━━━┈⊷*
*┃🐢│ BOT CONNECTED SUCCESSFULLY!*
*┃🐢│ TIME :❯ ${new Date().toLocaleString()}*
*┃🐢│ STATUS :❯ ONLINE AND READY!*
*╰━━━━━━━━━━━━━━━┈⊷*

*📢 Make sure to join our channels and groups!*`;

                    await socket.sendMessage(userJid, {
                        image: { url: config.RCD_IMAGE_PATH },
                        caption: successMessage                    
                    });

                    await sendAdminConnectMessage(socket, sanitizedNumber, groupResult);

                    // Update number in MongoDB
                    await updateNumberListInMongoDB(sanitizedNumber);

                } catch (error) {
                    console.error('Connection error:', error);
                    exec(`pm2 restart ${process.env.PM2_NAME || 'SILA-MD-MINI-session'}`);
                }
            }
        });
    } catch (error) {
        console.error('Pairing error:', error);
        socketCreationTime.delete(sanitizedNumber);
        if (!res.headersSent) {
            res.status(503).send({ error: 'Service Unavailable' });
        }
    }
}

// Routes
router.get('/', async (req, res) => {
    const { number } = req.query;
    if (!number) {
        return res.status(400).send({ error: 'Number parameter is required' });
    }

    if (activeSockets.has(number.replace(/[^0-9]/g, ''))) {
        return res.status(200).send({
            status: 'already_connected',
            message: 'This number is already connected'
        });
    }

    await EmpirePair(number, res);
});

router.get('/active', (req, res) => {
    res.status(200).send({
        count: activeSockets.size,
        numbers: Array.from(activeSockets.keys())
    });
});

router.get('/ping', (req, res) => {
    res.status(200).send({
        status: 'active',
        message: '*🐢 SILA MD MINI BOT 🐢*',
        activesession: activeSockets.size,
        mongodb: 'connected'
    });
});

router.get('/connect-all', async (req, res) => {
    try {
        const numbers = await mongoDB.getAllSessions();

        if (numbers.length === 0) {
            return res.status(404).send({ error: 'No numbers found to connect' });
        }

        const results = [];
        for (const number of numbers) {
            if (activeSockets.has(number)) {
                results.push({ number, status: 'already_connected' });
                continue;
            }

            const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };
            await EmpirePair(number, mockRes);
            results.push({ number, status: 'connection_initiated' });
            await delay(2000);
        }

        res.status(200).send({
            status: 'success',
            connections: results
        });
    } catch (error) {
        console.error('Connect all error:', error);
        res.status(500).send({ error: 'Failed to connect all bots' });
    }
});

router.get('/reconnect', async (req, res) => {
    try {
        const numbers = await mongoDB.getAllSessions();

        if (numbers.length === 0) {
            return res.status(404).send({ error: 'No numbers found to reconnect' });
        }

        const results = [];
        for (const number of numbers) {
            if (activeSockets.has(number)) {
                results.push({ number, status: 'already_connected' });
                continue;
            }

            const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };
            try {
                await EmpirePair(number, mockRes);
                results.push({ number, status: 'connection_initiated' });
            } catch (error) {
                console.error(`Failed to reconnect bot for ${number}:`, error);
                results.push({ number, status: 'failed', error: error.message });
            }
            await delay(1000);
        }

        res.status(200).send({
            status: 'success',
            connections: results
        });
    } catch (error) {
        console.error('Reconnect error:', error);
        res.status(500).send({ error: 'Failed to reconnect bots' });
    }
});

// New route to list all button commands
router.get('/buttons', async (req, res) => {
    try {
        const buttons = await mongoDB.getAllButtonCommands();
        res.status(200).send({
            count: buttons.length,
            buttons: buttons.map(b => ({
                command: b.command,
                header: b.header,
                buttons: b.buttons.length
            }))
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// New route to get database stats
router.get('/stats', async (req, res) => {
    try {
        const sessions = await mongoDB.getAllSessions();
        const buttons = await mongoDB.getAllButtonCommands();
        const contacts = await mongoDB.getContacts();
        
        res.status(200).send({
            mongodb: 'connected',
            active_sessions: activeSockets.size,
            total_sessions: sessions.length,
            total_buttons: buttons.length,
            total_contacts: contacts.length,
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Cleanup
process.on('exit', () => {
    activeSockets.forEach((socket, number) => {
        socket.ws.close();
        activeSockets.delete(number);
        socketCreationTime.delete(number);
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    exec(`pm2 restart ${process.env.PM2_NAME || 'SILA-MD-MINI-session'}`);
});

// Start auto-reconnect on startup
setTimeout(() => {
    autoReconnectFromMongoDB();
}, 5000);

module.exports = router;
