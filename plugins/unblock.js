// 🌟 Code by BILAL
module.exports = {
  command: "unblock",
  alias: ["unb", "unbl", "unblo", "unblok", "unblocks", "unblocked", "unbloks", "unblk"],
  description: "Unblock user (reply in group or direct in inbox)",
  category: "owner",
  react: "☺️",
  usage: ".unblock (reply to user or use in inbox)",
  execute: async (socket, msg, args) => {
    try {
      const sender = msg.key.remoteJid;
      const botOwner = socket.user.id.split(":")[0] + "@s.whatsapp.net";
      const fromMe = msg.key.fromMe;

      // React
      await socket.sendMessage(sender, { react: { text: "☺️", key: msg.key } });

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
          text: "*AP NE AGAR KISI KO UNBLOCK KARNA HAI 🥺* \n *TO AP ESE LIKHO ☺️* \n\n`UNBLOCK`\n\n*TO WO UNBLOCK HO JAYE GA ☺️*"
        }, { quoted: msg });
        return;
      }

      // Unblock
      await socket.updateBlockStatus(jid, "unblock");
      await socket.sendMessage(sender, { react: { text: "🥰", key: msg.key } });
      await socket.sendMessage(sender, {
        text: `*MENE APKO UNBLOCK KAR DYA HAI ☺️ AB AP MUJHE TANG MAT KARNA PLEASE 🥰 WARNA AP PHIR BLOCK HO JAYE GE 😒*`,
        mentions: [jid],
        quoted: msg
      });

    } catch (error) {
      console.error("Unblock Error:", error);
      await socket.sendMessage(msg.key.remoteJid, { react: { text: "🥺", key: msg.key } });
      await socket.sendMessage(msg.key.remoteJid, {
        text: "*AP ABHI TAK UNBLOCK NAHI HUWE 😔*"
      }, { quoted: msg });
    }
  }
};
