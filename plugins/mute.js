module.exports = {
  command: "mute",
  desc: "Mute the group (only admins can send messages)",
  category: "group",
  use: ".mute",
  fromMe: true,
  filename: __filename,

  execute: async (sock, msg) => {
    const { remoteJid } = msg.key;
    await sock.groupSettingUpdate(remoteJid, "announcement");
    await sock.sendMessage(remoteJid, { text: "*THIS GROUP IS NOW CLOSED 🥺* \n *NOW YOU ALL CANNOT CHAT IN THIS GROUP 😇* \n *THIS GROUP WILL OPEN VERY SOON 🥰*" }, { quoted: msg });
  }
};
