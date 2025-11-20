const baileys = require('@whiskeysockets/baileys');
const crypto = require('crypto');
const fs = require('fs');

module.exports = {
  command: 'groupstatus',
  description: 'Send a text or media status visible to all group members.',
  category: 'group',
  react: '🟢',

  /**
   * Execute Command
   */
  execute: async (socket, msg, args, number) => {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');

    // 🧱 1. Restrict to group chats only
    if (!isGroup) {
      return await socket.sendMessage(from, {
        text: "⚠️ This command only works in groups!"
      }, { quoted: msg });
    }

    const quoted = msg.quoted;
    const mime = (quoted?.mimetype || msg.message?.mimetype || '');
    const q = args.join(' ');

    // 🧩 2. Prepare group status content
    let content = {};
    if ((mime && /image|video/.test(mime)) || quoted?.mimetype) {
      const mediaMsg = quoted ? quoted : msg;
      const buffer = await mediaMsg.download();
      const type = (mediaMsg.mimetype || '').split('/')[0];

      if (type === 'image') {
        content = {
          image: buffer,
          caption: q || '📸 Group Photo Update!',
        };
      } else if (type === 'video') {
        content = {
          video: buffer,
          caption: q || '🎬 Group Video Update!',
        };
      }
    } else {
      if (!q) {
        return await socket.sendMessage(from, {
          text: "📜 Use: *.groupstatus <text>* or reply to an image/video with caption."
        }, { quoted: msg });
      }
      content = {
        text: q,
        backgroundColor: '#25D366'
      };
    }

    // 🧠 3. Send group status
    try {
      const statusMsg = await sendGroupStatus(socket, from, content);
      await socket.sendMessage(from, {
        text: "✅ Group status posted successfully! (expires in 24h)"
      }, { quoted: msg });

      // Auto delete after 24h
      setTimeout(async () => {
        try {
          await socket.sendMessage(from, { delete: statusMsg.key });
          console.log(`🕒 Auto-deleted group status in ${from}`);
        } catch (e) {
          console.error('⚠️ Auto-delete failed:', e);
        }
      }, 24 * 60 * 60 * 1000);
    } catch (err) {
      console.error('❌ Failed to send group status:', err);
      await socket.sendMessage(from, {
        text: '❌ Failed to send group status.'
      }, { quoted: msg });
    }
  }
};

/**
 * 🧩 Function: Send Group Status (with optional media + auto expire)
 */
async function sendGroupStatus(client, jid, content) {
  try {
    const { backgroundColor } = content;
    delete content.backgroundColor;

    const inside = await baileys.generateWAMessageContent(content, {
      upload: client.waUploadToServer,
      backgroundColor
    });

    const messageSecret = crypto.randomBytes(32);
    const m = baileys.generateWAMessageFromContent(
      jid,
      {
        messageContextInfo: { messageSecret },
        groupStatusMessageV2: {
          message: {
            ...inside,
            messageContextInfo: { messageSecret }
          }
        }
      },
      {}
    );

    await client.relayMessage(jid, m.message, { messageId: m.key.id });
    return m;
  } catch (err) {
    console.error('❌ GroupStatus Error:', err);
  }
                  }
