const axios = require("axios");

function formatDuration(seconds) {
  if (!seconds) return "N/A";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

module.exports = {
  command: "xnxx",
  alias: ["xn", "xnxxdl"],
  desc: "Download Video from Xnxx.com",
  react: "⬇️",
  category: "download",

  execute: async (sock, msg, args) => {
    try {
      const from = msg.key.remoteJid;
      const url = args[0];
      const pushname = msg.pushName || "User";

      if (!url || (!url.includes("xnxx.com") && !url.includes("xnxx.health"))) {
        return sock.sendMessage(from, {
          text: `*XNXX DOWNLOADER*\n\n❌ Tuma link halali ya Xnxx!\n_Mfano:_\n*.xnxx https://www.xnxx.com/video-xxxxxx/title*`
        }, { quoted: msg });
      }

      await sock.sendPresenceUpdate("composing", from);

      const apiUrl = `https://api.giftedtech.co.ke/api/download/xnxxdl?apikey=gifted&url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data.status || !data.result) {
        return sock.sendMessage(from, { text: "❌ Video haipatikani au link imeharibika." }, { quoted: msg });
      }

      const result = data.result;
      const title = result.title || "No title";
      const duration = formatDuration(result.duration);
      const views = result.views ? result.views.toLocaleString() : "N/A";
      const thumb = result.thumb || result.thumbnail || "https://files.catbox.moe/90i7j4.png";

      const qualities = [];
      if (result.high) qualities.push({ quality: "HD", url: result.high });
      if (result.low) qualities.push({ quality: "SD", url: result.low });
      if (result.hls) qualities.push({ quality: "HLS", url: result.hls });

      if (qualities.length === 0) {
        return sock.sendMessage(from, { text: "❌ Hakuna video quality inayopatikana." }, { quoted: msg });
      }

      let optionsText = "";
      qualities.forEach((q, i) => {
        optionsText += `│ ├ ${i + 1} → ${q.quality} Quality\n`;
      });

      const caption = `
*XNXX DOWNLOADER*
╭────────────────⭓
│ 👤 Requested by: ${pushname}
│ 🎬 Title: ${title}
│ ⏱ Duration: ${duration}
│ 👁 Views: ${views}
│ 🔗 Source: ${url}
│
│ 📥 Chagua Quality:
${optionsText}│
╰────────────────⭓`;

      const sentMsg = await sock.sendMessage(from, {
        image: { url: thumb },
        caption
      }, { quoted: msg });

      const msgId = sentMsg.key.id;

      const listener = async (update) => {
        try {
          const mek = update.messages[0];
          if (!mek.message) return;
          if (mek.key.remoteJid !== from) return;

          const isReply = mek.message?.extendedTextMessage?.contextInfo?.stanzaId === msgId;
          if (!isReply) return;

          const choice = mek.message.conversation || mek.message.extendedTextMessage?.text;
          const num = parseInt(choice.trim());

          if (isNaN(num) || num < 1 || num > qualities.length) {
            return sock.sendMessage(from, { text: "❌ Chagua namba sahihi!" }, { quoted: mek });
          }

          await sock.sendReact(from, { text: "⬇️", key: mek.key });
          await sock.sendPresenceUpdate("recording", from);

          const selected = qualities[num - 1];
          const videoCaption = `*XNXX* • ${selected.quality}\n${title}`;

          await sock.sendMessage(from, {
            video: { url: selected.url },
            caption: videoCaption,
            mimetype: "video/mp4"
          }, { quoted: mek });

          await sock.sendReact(from, { text: "✅", key: mek.key });
        } catch (err) {
          console.error("Xnxx reply error:", err);
          await sock.sendMessage(from, { text: `❌ Hitilafu: ${err.message}` }, { quoted: mek });
        }
      };

      sock.ev.on("messages.upsert", listener);
      setTimeout(() => sock.ev.off("messages.upsert", listener), 5 * 60 * 1000);

    } catch (err) {
      console.error("Xnxx command error:", err);
      await sock.sendMessage(from, {
        text: `❌ Hitilafu: ${err.message || err}`
      }, { quoted: msg });
    }
  }
};
