// 🌟 Code by BILAL
module.exports = {
  command: "block",
  alias: ["b", "bl", "blo", "bloc", "blok", "blocks", "blocked", "bloks", "blk", "khatam", "bye"],
  description: "Block user (reply in group or direct in inbox)",
  category: "owner",
  react: "🤐",
  usage: ".block (reply to user or use in inbox)",
  execute: async (socket, msg, args) => {
    try {
      const sender = msg.key.remoteJid;
      const botOwner = socket.user.id.split(":")[0] + "@s.whatsapp.net";
      const fromMe = msg.key.fromMe;

      // React 🥺
      await socket.sendMessage(sender, { react: { text: "🤐", key: msg.key } });

      // Owner check
      if (!fromMe && msg.participant !== botOwner && msg.key.participant !== botOwner) {
        return await socket.sendMessage(sender, { text: "*YEH COMMAND SIRF MERE LIE HAI ☺️*", quoted: msg });
      }

      // Determine JID
      let jid;
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;

      if (quoted) {
        jid = quoted;
      } else if (sender.endsWith("@s.whatsapp.net")) {
        jid = sender;
      } else {
        await socket.sendMessage(sender, {
          text: "*AGAR AP NE KISI KO BLOCK KARNA HAI 🥺* \n *TO AP ESE LIKHO ☺️* \n\n`BLOCK`\n\n*TO WO BLOCK HO JAYE GA ☺️*"
        }, { quoted: msg });
        return;
      }

      // Message before block
      await socket.sendMessage(sender, { text: "*AP MUJHE BAHUT TANG KAR RAHE HAI IS LIE MENE APKO BLOCK KAR DIYA 😒*", quoted: msg });

      // Delay 1.5s then block
      setTimeout(async () => {
        await socket.updateBlockStatus(jid, "block");
        await socket.sendMessage(sender, { react: { text: "😡", key: msg.key } });
      }, 1500);

    } catch (error) {
      console.error("Block Error:", error);
      await socket.sendMessage(msg.key.remoteJid, { react: { text: "😔", key: msg.key } });
      await socket.sendMessage(msg.key.remoteJid, {
        text: "*AP ABHI TAK BLOCK NAHI HUWE 😔*"
      }, { quoted: msg });
    }
  }
};
