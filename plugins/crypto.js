const axios = require("axios");

module.exports = {
    command: "crypto",
    alias: ["bitcoin", "btc", "eth"],
    description: "Get cryptocurrency prices",
    category: "tools",
    react: "💰", 
    usage: ".crypto [coin]",
    execute: async (socket, msg, args) => {
        const sender = msg.key.remoteJid;
        const coin = args[0]?.toLowerCase() || "bitcoin";

        try {
            await socket.sendMessage(sender, { react: { text: "⏳", key: msg.key } });

            const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin}`);
            const data = response.data;

            const cryptoInfo = `
*💰 ${data.name.toUpperCase()} (${data.symbol.toUpperCase()})*

💵 Price: $${data.market_data.current_price.usd}
📈 24h Change: ${data.market_data.price_change_percentage_24h}%
🏆 Rank: #${data.market_cap_rank}
💼 Market Cap: $${data.market_data.market_cap.usd.toLocaleString()}
🔄 24h Volume: $${data.market_data.total_volume.usd.toLocaleString()}

*Powered by SILA MD MINI s1*
            `.trim();

            await socket.sendMessage(sender, { text: cryptoInfo }, { quoted: msg });
            await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });

        } catch (error) {
            await socket.sendMessage(sender, { 
                text: "*❌ COIN NOT FOUND*\n\nUse: .crypto bitcoin, .crypto ethereum, etc."
            }, { quoted: msg });
            await socket.sendMessage(sender, { react: { text: "❌", key: msg.key } });
        }
    }
};
