const axios = require("axios");

module.exports = {
    command: "quote",
    alias: ["kataba", "inspire"],
    description: "Get random inspirational quotes",
    category: "fun",
    react: "💫", 
    usage: ".quote",
    execute: async (socket, msg, args) => {
        const sender = msg.key.remoteJid;

        try {
            await socket.sendMessage(sender, { react: { text: "⏳", key: msg.key } });

            const response = await axios.get("https://api.quotable.io/random");
            const quote = response.data;

            const quoteText = `
*💫 INSPIRATIONAL QUOTE*

"${quote.content}"

- *${quote.author}*

*Tags:* ${quote.tags.join(", ")}

*Powered by SILA MD MINI s1*
            `.trim();

            await socket.sendMessage(sender, { text: quoteText }, { quoted: msg });
            await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });

        } catch (error) {
            await socket.sendMessage(sender, { 
                text: "*❌ ERROR*\n\nFailed to fetch quote. Please try again later."
            }, { quoted: msg });
            await socket.sendMessage(sender, { react: { text: "❌", key: msg.key } });
        }
    }
};
