module.exports = {
  command: "alive",
  description: "Check if bot is running",
  category: "info",

  async execute(sock, msg) {
    try {
      const jid = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;
      const jidName = sender.split("@")[0];

      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();
      const speed = Math.floor(Math.random() * 90 + 10);

      const caption = `*HELLO ☺️*
      *HOW ARE YOU? 😇*
      *I HOPE YOU ARE DOING WELL INSHALLAH 🤲*
      *I AM SILA MD MINI BOT USER ☺️*
      
      *🐢 OWNER INFO 🐢*
255612491554/Sila/

*🐢 SUPPORT CHANNEL 🐢*
https://whatsapp.com/channel/0029VbBPxQTJUM2WCZLB6j28

*🐢 SUPPORT GROUP 🐢*
https://chat.whatsapp.com/IdGNaKt80DEBqirc2ek4ks
`;

      // Envoyer simplement le message avec l'image
      await sock.sendMessage(
        jid,
        {
          image: { url: 'https://files.catbox.moe/90i7j4.png' },
          caption: caption
        },
        { quoted: msg }
      );

    } catch (err) {
      console.error("❌ Error in alive command:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Error checking bot status",
      });
    }
  },
};
