const yts = require("yt-search");

module.exports = {
  command: "yts",
  alias: ["ytsearch", "youtube"],
  desc: "Search videos from YouTube.",
  category: "search",
  usage: ".yts <video name>",

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;
      const q = args.join(" ");

      if (!q) {
        return await sock.sendMessage(jid, {
          text: `*📺 Aap YouTube ki video search karna chahte ho?*\n\nExample:\n> .yts bilal md bot\n> .ytsearch funny memes\n\n*Ye likhne par YouTube videos ki list mil jayegi 😍*`,
        }, { quoted: msg });
      }

      // 🔎 Search on YouTube
      const search = await yts(q);

      if (!search.all || search.all.length === 0) {
        return await sock.sendMessage(jid, {
          text: "❌ Koi result nahi mila, dubara try karein 🥺",
        }, { quoted: msg });
      }

      // 📝 Format results
      let resultText = `*🔍 YouTube Results for:* ${q}\n\n`;
      search.all.slice(0, 10).forEach((video, index) => {
        resultText += `*${index + 1}. ${video.title}*\n📺 ${video.url}\n\n`;
      });

      await sock.sendMessage(jid, { text: resultText }, { quoted: msg });

    } catch (e) {
      console.error("YouTube Search Error:", e);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "*⚠️ Command Error: Dubara koshish kare 🥺*",
      }, { quoted: msg });
    }
  },
};
