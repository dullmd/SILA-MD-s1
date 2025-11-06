const axios = require("axios");

module.exports = {
  command: "fancy",
  alias: ["font", "style", "textfont", "fancyname", "ftext", "fancymsg", "fonts"],
  react: "🥺",
  desc: "Convert text into fancy fonts.",
  category: "tools",

  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;
      const q = args.join(" ");

      if (!q) {
        return sock.sendMessage(from, {
          text:
            "*APKO APNE NAME KO FANCY TEXT ME STYLISH BANANA HAI ☺️♥️*\n" +
            "*TO AP ESE LIKHO 🥰🌹*\n\n" +
            "*❮FANCY BILAL-MD❯*\n\n" +
            "*JAB ESE LIKHE GE TO APKA NAMES FANCY TEXT ME SHOW HOGE ☺️♥️*",
        }, { quoted: msg });
      }

      const apiUrl = `https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(q)}`;
      const res = await axios.get(apiUrl);

      if (!res.data.status || !res.data.result) {
        await sock.sendMessage(from, { text: "*DUBARA KOSHISH KARE 🥺💓*" }, { quoted: msg });
        return;
      }

      const fonts = res.data.result.map(item => item.result).join("\n\n");

      const resultText = `*APKE NAME KE FANCY TEXT ☺️💞*\n\n${fonts}\n\n*👑 MINI BILAL-MD BOT 👑*`;

      await sock.sendMessage(from, { text: resultText }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: "☺️", key: msg.key } });

    } catch (err) {
      console.error("Fancy Command Error:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: `*❌ ERROR:* ${err.message}` }, { quoted: msg });
    }
  },
};
