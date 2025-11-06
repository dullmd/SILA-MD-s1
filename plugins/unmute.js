module.exports = {
  command: "unmute",
  desc: "Unmute the group (everyone can chat)",
  category: "group",
  use: ".unmute",
  fromMe: true,
  filename: __filename,

  execute: async (sock, msg) => {
    const { remoteJid } = msg.key;
    await sock.groupSettingUpdate(remoteJid, "not_announcement");
    await sock.sendMessage(remoteJid, { text: "*𝚃𝙷𝙸𝚂 𝙶𝚁𝙾𝚄𝙿 𝙸𝚂 𝙽𝙾𝚆 𝙾𝙿𝙴𝙽 𝙰𝙶𝙰𝙸𝙽 😃* \n*𝙽𝙾𝚆 𝚈𝙾𝚄 𝙰𝙻𝙻 𝙲𝙰𝙽 𝙲𝙷𝙰𝚃 𝙸𝙽 𝚃𝙷𝙸𝚂 𝙶𝚁𝙾𝚄𝙿 🥰* " }, { quoted: msg });
  }
};
