module.exports = {
  command: 'video',
  alias: ["ytmp4","mp4","ytv","vi","v","vid","vide","videos","ytvi","ytvid","ytvide","ytvideos","searchyt","download","get","need","search"],
  description: "Download YouTube MP4",
  category: "download",
  react: "🥺",
  usage: ".video <video name>",
  execute: async (socket, msg, args) => {
    const sender = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
      return await socket.sendMessage(sender, { text: "*𝙳𝙾 𝚈𝙾𝚄 𝚆𝙰𝙽𝚃 𝚃𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 𝙰𝙽𝚈 𝚅𝙸𝙳𝙴𝙾 🥺*\n*𝚃𝙷𝙴𝙽 𝚆𝚁𝙸𝚃𝙴 𝙻𝙸𝙺𝙴 𝚃𝙷𝙸𝚂 😇*\n\n*𝚅𝙸𝙳𝙴𝙾 ❮𝚈𝙾𝚄𝚁 𝚅𝙸𝙳𝙴𝙾 𝙽𝙰𝙼𝙴❯*\n\n*𝚆𝚁𝙸𝚃𝙴 𝙲𝙾𝙼𝙼𝙰𝙽𝙳 ❮𝚅𝙸𝙳𝙴𝙾❯ 𝙰𝙽𝙳 𝚃𝙷𝙴𝙽 𝚈𝙾𝚄𝚁 𝚅𝙸𝙳𝙴𝙾 𝙽𝙰𝙼𝙴 ☺️ 𝚃𝙷𝙴𝙽 𝚃𝙷𝙰𝚃 𝚅𝙸𝙳𝙴𝙾 𝚆𝙸𝙻𝙻 𝙱𝙴 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝙳 𝙰𝙽𝙳 𝚂𝙴𝙽𝚃 𝙷𝙴𝚁𝙴 🥰💞*" }, { quoted: msg });
    }

    const yts = require('yt-search');
    const axios = require('axios');

    try {
      const search = await yts(text);
      if (!search.videos.length) return await socket.sendMessage(sender, { text: "*MUJHE APKI VIDEO NAHI MIL RAHI SORRY 🥺❤️*" }, { quoted: msg });

      const data = search.videos[0];
      const ytUrl = data.url;

      // Replace 'APIKEY' with your actual API key
      const api = `https://gtech-api-xtp1.onrender.com/api/video/yt?apikey=APIKEY&url=${encodeURIComponent(ytUrl)}`;
      const { data: apiRes } = await axios.get(api);

      if (!apiRes?.status || !apiRes.result?.media?.video_url) {
        return await socket.sendMessage(sender, { text: "*𝚈𝙾𝚄𝚁 𝚅𝙸𝙳𝙴𝙾 𝙸𝚂 𝙽𝙾𝚃 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶 🥺 𝙿𝙻𝙴𝙰𝚂𝙴 𝚃𝚁𝚈 𝙰𝙶𝙰𝙸𝙽 ☺️*" }, { quoted: msg });

      }

      const result = apiRes.result.media;

      const caption = `*⟪════════ ♢.✰.♢ ════════⟫*
*🐢 𝚅𝙸𝙳𝙴𝙾 𝙽𝙰𝙼𝙴 🐢*
*${data.title}*

*🐢 𝙻𝙸𝙽𝙺 :❯ ${data.url}*
*🐢 𝚅𝙸𝙴𝚆𝚂 :❯ ${data.views}*
*🐢 𝚃𝙸𝙼𝙴 :❯ ${data.timestamp}*

*🐢 𝙸𝙼𝙿𝙾𝚁𝚃𝙰𝙽𝚃 𝚃𝙾𝙿𝙸𝙲 🐢*
*𝙵𝙸𝚁𝚂𝚃 𝙼𝙴𝙽𝚃𝙸𝙾𝙽 𝙼𝚈 𝙼𝙴𝚂𝚂𝙰𝙶𝙴 𝙸𝚃'𝚂 𝙲𝙾𝙼𝙿𝚄𝙻𝚂𝙾𝚁𝚈 😫 𝙸𝙵 𝚈𝙾𝚄 𝚆𝙰𝙽𝚃 𝚂𝙸𝙼𝙿𝙻𝙴 𝚅𝙸𝙳𝙴𝙾 𝚃𝙷𝙴𝙽 𝚆𝚁𝙸𝚃𝙴 𝙽𝚄𝙼𝙱𝙴𝚁 ❮1❯ ☺️ 𝙸𝙵 𝚈𝙾𝚄 𝚆𝙰𝙽𝚃 𝚅𝙸𝙳𝙴𝙾 𝙸𝙽 𝙵𝙸𝙻𝙴 𝚃𝙷𝙴𝙽 𝚆𝚁𝙸𝚃𝙴 𝙽𝚄𝙼𝙱𝙴𝚁 ❮2❯ 😇*

*❮1❯ 𝚂𝙸𝙼𝙿𝙻𝙴 𝚅𝙸𝙳𝙴𝙾*
*❮2❯ 𝙵𝙸𝙻𝙴 𝚅𝙸𝙳𝙴𝙾*
*⟪════════ ♢.✰.♢ ════════⟫*
`;

      const sentMsg = await socket.sendMessage(sender, { image: { url: result.thumbnail }, caption }, { quoted: msg });
      const messageID = sentMsg.key.id;

      socket.ev.on("messages.upsert", async (msgData) => {
        const receivedMsg = msgData.messages[0];
        if (!receivedMsg?.message) return;

        const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
        const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;
        const senderID = receivedMsg.key.remoteJid;

        if (isReplyToBot) {
          switch (receivedText.trim()) {
            case "1":
              await socket.sendMessage(senderID, { video: { url: result.video_url }, mimetype: "video/mp4" }, { quoted: receivedMsg });
              break;

            case "2":
              await socket.sendMessage(senderID, { document: { url: result.video_url }, mimetype: "video/mp4", fileName: `${data.title}.mp4` }, { quoted: receivedMsg });
              break;

            default:
              await socket.sendMessage(senderID, { text: "*🥺 Sirf 1 ya 2 reply me bhejo!*" }, { quoted: receivedMsg });
          }
        }
      });

    } catch (error) {
      console.error("Video download error:", error);
      await socket.sendMessage(sender, { text: "*😔 Video download nahi hui!*" }, { quoted: msg });
    }
  }
};
