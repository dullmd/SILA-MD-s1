const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const mongoDB = require('./lib/mongoDB');

let commandMap = {};
global.autoSave = false;

async function loadPlugins() {
  commandMap = {};
  fs.readdirSync('./plugins').forEach(file => {
    const plugin = require('./plugins/' + file);
    if (plugin.command) {
      const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
      cmds.forEach(cmd => {
        commandMap[cmd] = plugin;
      });
    }
  });
  console.log(`✅ Loaded ${Object.keys(commandMap).length} commands`);
}

async function start() {
  await mongoDB.connectToMongoDB();
  await loadPlugins();
  
  // Load settings
  const settings = await mongoDB.getAllSettings();
  const config = settings;
  
  // Create session directory
  const sessionDir = './session';
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);
  
  // Get all sessions and connect
  const sessions = await mongoDB.getAllSessions();
  
  for (const number of sessions) {
    try {
      const sessionPath = path.join(sessionDir, `session_${number}`);
      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
      
      // Load saved creds from MongoDB
      const savedCreds = await mongoDB.getSession(number);
      if (savedCreds) {
        fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(savedCreds, null, 2));
      }
      
      const conn = makeWASocket({
        auth: state,
        printQRInTerminal: true,
      });

      conn.ev.on('creds.update', async () => {
        await saveCreds();
        // Save to MongoDB
        const fileContent = fs.readFileSync(path.join(sessionPath, 'creds.json'), 'utf8');
        await mongoDB.saveSession(number, JSON.parse(fileContent));
      });

      conn.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const sender = m.key.remoteJid;
        const pushName = m.pushName || 'Unknown';
        const body = m.message.conversation || m.message.extendedTextMessage?.text || '';
        
        // Auto-save contacts
        if (global.autoSave && sender.endsWith('@s.whatsapp.net')) {
          await mongoDB.saveContact(sender, pushName);
        }

        // Check for button commands first
        const buttonCmd = await mongoDB.getButtonCommand(body.toLowerCase());
        if (buttonCmd && buttonCmd.buttons) {
          // Send button message
          const buttons = buttonCmd.buttons.map(btn => ({
            buttonId: `${body.toLowerCase()}:${btn.buttonId}`,
            buttonText: { displayText: btn.buttonText },
            type: 1
          }));

          await conn.sendMessage(sender, {
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
              }
            }
          }, { quoted: m });
          return;
        }

        // Check for regular commands
        if (!body.startsWith(config.PREFIX)) return;
        
        const commandName = body.slice(1).split(' ')[0].toLowerCase();
        const args = body.trim().split(/\s+/).slice(1);

        const command = commandMap[commandName];
        if (command) {
          try {
            await command.execute(conn, m, { args });
          } catch (e) {
            console.error(`❌ Error in command ${commandName}:`, e);
            await conn.sendMessage(sender, { text: `⚠️ Command error: ${e.message}` });
          }
        }
      });

      conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
          if (shouldReconnect) {
            start(); // reconnect
          } else {
            console.log('🔒 Connection closed. Logged out.');
            mongoDB.deleteSession(number);
          }
        } else if (connection === 'open') {
          console.log(`✅ Connected: ${number}`);
        }
      });

    } catch (error) {
      console.error(`❌ Failed to connect ${number}:`, error);
    }
  }
}

start();
