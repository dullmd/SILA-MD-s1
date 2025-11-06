const axios = require('axios');

module.exports = {
  command: 'tiktok',
  alias: ["ttdl","tt","tiktokdl"],
  description: "Download TikTok video without watermark",
  category: "download",
  react: "🎵",
  usage: ".tiktok <TikTok URL>",
  execute: async (socket, msg, args) => {
    const sender = msg.key.remoteJid;
    const text = args.join(" ");

    let waitMsg; // Waiting message reference

    try {
      // React command message
      await socket.sendMessage(sender, { react: { text: "🥺", key: msg.key } });

      if (!text) return await socket.sendMessage(sender, {
        text: "*𝙸𝙵 𝚈𝙾𝚄 𝚆𝙰𝙽𝚃 𝚃𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 𝚃𝙸𝙺𝚃𝙾𝙺 𝚅𝙸𝙳𝙴𝙾 🥺💓* \n *𝚃𝙷𝙴𝙽 𝚆𝚁𝙸𝚃𝙴 𝙻𝙸𝙺𝙴 𝚃𝙷𝙸𝚂 😇♥️* \n \n *𝚃𝙸𝙺𝚃𝙾𝙺 ❮𝚈𝙾𝚄𝚁 𝚃𝙸𝙺𝚃𝙾𝙺 𝚅𝙸𝙳𝙴𝙾 𝙻𝙸𝙽𝙺❯* \n\n *𝚆𝚁𝙸𝚃𝙴 𝙲𝙾𝙼𝙼𝙰𝙽𝙳 ❮𝚃𝙸𝙺𝚃𝙾𝙺❯ 𝙰𝙽𝙳 ☺️* \n *𝙰𝙵𝚃𝙴𝚁 𝚃𝙷𝙰𝚃 𝙿𝙰𝚂𝚃𝙴 𝚈𝙾𝚄𝚁 𝚃𝙸𝙺𝚃𝙾𝙺 𝚅𝙸𝙳𝙴𝙾 𝙻𝙸𝙽𝙺 😊* \n *𝚃𝙷𝙴𝙽 𝚈𝙾𝚄𝚁 𝚃𝙸𝙺𝚃𝙾𝙺 𝚅𝙸𝙳𝙴𝙾 𝚆𝙸𝙻𝙻 𝙱𝙴 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝙳 😍* \n *𝙰𝙽𝙳 𝚂𝙴𝙽𝚃 𝙷𝙴𝚁𝙴 🥰*"
      }, { quoted: msg });

      if (!text.includes("tiktok.com")) {
        await socket.sendMessage(sender, { react: { text: "☹️", key: msg.key } });
        return await socket.sendMessage(sender, { text: "*𝚈𝙾𝚄𝚁 𝚃𝙸𝙺𝚃𝙾𝙺 𝚅𝙸𝙳𝙴𝙾 𝙲𝙾𝚄𝙻𝙳 𝙽𝙾𝚃 𝙱𝙴 𝙵𝙾𝚄𝙽𝙳 ☹️*" }, { quoted: msg });
      }

      // Send waiting message
      waitMsg = await socket.sendMessage(sender, { text: "*𝚈𝙾𝚄𝚁 𝚃𝙸𝙺𝚃𝙾𝙺 𝚅𝙸𝙳𝙴𝙾 𝙸𝚂 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶 ☺️*\n*𝚆𝙷𝙴𝙽 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 𝙸𝚂 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙴 𝙸𝚃 𝚆𝙸𝙻𝙻 𝙱𝙴 𝚂𝙴𝙽𝚃 𝙷𝙴𝚁𝙴 🥰*" });

      const apiUrl = `https://lance-frank-asta.onrender.com/api/tikdl?url=${text}`;
      const { data } = await axios.get(apiUrl);
      
      if (!data.status || !data.data) {
        if (waitMsg) await socket.sendMessage(sender, { delete: waitMsg.key });
        await socket.sendMessage(sender, { react: { text: "😔", key: msg.key } });
        return await socket.sendMessage(sender, { text: "*😔 Dubara koshish karo!*" }, { quoted: msg });
      }

      const { meta } = data.data;
      const videoUrl = meta.media.find(v => v.type === "video").org;

      // Caption
      const caption = "*🐢 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚂𝙸𝙻𝙰 𝙼𝙳 🐢*";

      // Send video
      await socket.sendMessage(sender, {
        video: { url: videoUrl },
        caption,
        contextInfo: { mentionedJid: [msg.sender] }
      }, { quoted: msg });

      // Delete waiting message
      if (waitMsg) await socket.sendMessage(sender, { delete: waitMsg.key });

      // React after success
      await socket.sendMessage(sender, { react: { text: "☺️", key: msg.key } });

    } catch (e) {
      console.error("TikTok command error:", e);
      if (waitMsg) await socket.sendMessage(sender, { delete: waitMsg.key });
      await socket.sendMessage(sender, { react: { text: "😔", key: msg.key } });
      await socket.sendMessage(sender, { text: "*😔 Dubara koshish karo!*" }, { quoted: msg });
    }
  }
};
