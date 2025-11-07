module.exports = {
  command: "girl2",
  alias: ["g2", "girlpro"],
  desc: "Premium Random Girl Video v2 (HD+)",
  react: "💦",
  category: "download",

  execute: async (sock, msg) => {
    try {
      const from = msg.key.remoteJid;
      const pushname = msg.pushName || "User";

      await sock.sendPresenceUpdate("composing", from);

      const girl2Videos = [
        "https://telegra.ph/file/7b2c2e8f8c5d4e8e8f8e8.mp4",
        "https://telegra.ph/file/f1a2b3c4d5e6f7g8h9i0j.mp4",
        "https://telegra.ph/file/a1b2c3d4e5f6g7h8i9j0k.mp4",
        "https://telegra.ph/file/9f8e7d6c5b4a3f2e1d0c9.mp4",
        "https://telegra.ph/file/5h4g3f2e1d0c9b8a7f6e5.mp4",
        "https://telegra.ph/file/k9j8h7g6f5e4d3c2b1a0z.mp4",
        "https://telegra.ph/file/z0y9x8w7v6u5t4r3e2w1q.mp4",
        "https://telegra.ph/file/q1w2e3r4t5y6u7i8o9p0a.mp4",
        "https://telegra.ph/file/p0o9i8u7y6t5r4e3w2q1z.mp4",
        "https://telegra.ph/file/1a2b3c4d5e6f7g8h9i0j1.mp4",
        "https://m.top4top.io/m_1967a1b2c1.mp4",
        "https://l.top4top.io/m_1967x9y8z1.mp4",
        "https://a.top4top.io/m_1967p0o9i1.mp4",
        "https://b.top4top.io/m_1967q1w2e1.mp4",
        "https://c.top4top.io/m_1967r3t4y1.mp4",
        "https://e.top4top.io/m_1967u5i6o1.mp4",
        "https://f.top4top.io/m_1967p7l8k1.mp4",
        "https://g.top4top.io/m_1967j9h8g1.mp4",
        "https://h.top4top.io/m_1967f6d5s1.mp4",
        "https://i.top4top.io/m_1967a4s3d1.mp4",
        "https://j.top4top.io/m_1967z2x1c1.mp4",
        "https://k.top4top.io/m_1967v8b7n1.mp4"
      ];

      const randomVideo = girl2Videos[Math.floor(Math.random() * girl2Videos.length)];

      const caption = `
💦 *GIRL PRO v2* 💦
╭────────────────⭓
│ 👤 Requested by: ${pushname}
│ 🎥 Premium Random Clip
│ 🔥 Total videos: 22 (HD+)
│ ⚡ Fast • No Ads • Direct
│ 🕒 ${new Date().toLocaleTimeString('sw-TZ')}
╰────────────────⭓`;

      await sock.sendMessage(from, {
        video: { url: randomVideo },
        caption: caption,
        mimetype: "video/mp4",
        gifPlayback: false
      }, { quoted: msg });

      await sock.sendReact(from, { text: "✅", key: msg.key });

    } catch (err) {
      console.error("Girl2 command error:", err);
      await sock.sendMessage(from, {
        text: `❌ Hitilafu ya kutuma video!\nJaribu tena baadaye.`
      }, { quoted: msg });
    }
  }
};
