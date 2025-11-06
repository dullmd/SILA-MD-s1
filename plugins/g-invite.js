const fs = require("fs");

module.exports = {
  command: "invite",
  alias: ["glink", "grouplink"],
  react: "🥰",
  desc: "Get group invite link (Mini Bot Style)",
  category: "group",

  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;
      const isGroup = from.endsWith("@g.us");

      if (!isGroup) {
        return sock.sendMessage(from, { text: "*❌ YE COMMAND SIRF GROUPS ME USE HO SAKTI HAI ☺️*" }, { quoted: msg });
      }

      const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      const groupMetadata = await sock.groupMetadata(from);
      const groupAdmins = groupMetadata.participants.filter(p => p.admin);
      const isBotAdmin = groupAdmins.some(p => p.id === botNumber);

      if (!isBotAdmin) {
        return sock.sendMessage(from, { text: "*😅 Mujhe pehle admin banao tabhi link laa sakta hu ❤️*" }, { quoted: msg });
      }

      const inviteCode = await sock.groupInviteCode(from);
      const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
      const groupName = groupMetadata.subject || "Group";

      await sock.sendMessage(from, {
        text: `*👑 ${groupName} KA GROUP LINK 👑*\n\n🔗 ${inviteLink}\n\n*🥰 Apne doston ko bhejo aur bolo join kare ❤️*`,
      }, { quoted: msg });
    } catch (e) {
      console.error("Invite command error:", e);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ *ERROR:* ${e.message || "Unknown error"} 😢` }, { quoted: msg });
    }
  },
};
