const fs = require('fs');
const path = require('path');
const config = require('../lib/mongoDB');

module.exports = {
  command: "alive2",
  description: "Alive message with buttons",
  category: "info",

  async execute(sock, msg, args, userNumber) {
    try {
      const jid = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;
      const jidName = sender.split("@")[0];

      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();
      const speed = Math.floor(Math.random() * 90 + 10);
      
      // Load settings from MongoDB
      const settings = await config.getAllSettings();
      const prefix = settings.PREFIX || '.';
      const ownerNumber = settings.OWNER_NUMBER || '255612491554';
      const channelLink = settings.CHANNEL_LINK || 'https://whatsapp.com/channel/0029VbBPxQTJUM2WCZLB6j28';
      const groupLink = settings.GROUP_INVITE_LINK || 'https://chat.whatsapp.com/IdGNaKt80DEBqirc2ek4ks';

      const caption = `*HELLO ☺️*
*HOW ARE YOU? 😇*
*I HOPE YOU ARE DOING WELL INSHALLAH 🤲*
*I AM SILA MD MINI BOT USER ☺️*

*📊 SYSTEM INFO*
*• Date: ${date}*
*• Time: ${time}*
*• Speed: ${speed}ms*
*• Prefix: ${prefix}*

*🐢 OWNER INFO 🐢*
${ownerNumber}/Sila/

*🐢 SUPPORT CHANNEL 🐢*
${channelLink}

*🐢 SUPPORT GROUP 🐢*
${groupLink}

*👇 CLICK BUTTONS BELOW 👇*`;

      // Create buttons
      const buttons = [
        {
          buttonId: `${prefix}menu`,
          buttonText: { displayText: '📋 MENU' },
          type: 1
        },
        {
          buttonId: `${prefix}owner`,
          buttonText: { displayText: '👑 OWNER' },
          type: 1
        }
      ];

      const buttonMessage = {
        image: { url: 'https://files.catbox.moe/90i7j4.png' },
        caption: caption,
        footer: '🐢 SILA MD MINI BOT 🐢',
        buttons: buttons,
        headerType: 4,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: settings.NEWSLETTER_JID || '120363422610520277@newsletter',
            newsletterName: '🐢 SILA MD MINI BOT 🐢',
            serverMessageId: 143
          }
        }
      };

      await sock.sendMessage(jid, buttonMessage, { quoted: msg });
      console.log(`✅ Alive2 sent to ${jidName}`);

    } catch (err) {
      console.error("❌ Error in alive2 command:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Error sending alive2 message",
      });
    }
  },
};
