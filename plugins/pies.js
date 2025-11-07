const axios = require('axios');

module.exports = {
    command: "pies",
    alias: ["random", "image", "pic", "img"],
    desc: "Get random images from various categories",
    category: "download",
    react: "🖼️",
    filename: __filename,

    execute: async (sock, msg, args) => {
        try {
            const from = msg.key.remoteJid;
            const category = args[0]?.toLowerCase() || 'random';

            const categories = {
                'japan': 'Japanese',
                'korea': 'Korean', 
                'china': 'Chinese',
                'hijab': 'Hijab',
                'indonesia': 'Indonesian',
                'malaysia': 'Malaysian',
                'thailand': 'Thai',
                'vietnam': 'Vietnamese',
                'random': 'Random'
            };

            if (!categories[category]) {
                const availableCats = Object.keys(categories).join(', ');
                return await sock.sendMessage(from, {
                    text: `*🖼️ 𝚁𝙰𝙽𝙳𝙾𝙼 𝙸𝙼𝙰𝙶𝙴𝚂 🖼️*\n\n*𝙰𝚅𝙰𝙸𝙻𝙰𝙱𝙻𝙴 𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝙸𝙴𝚂:*\n${availableCats}\n\n*𝚄𝚂𝙰𝙶𝙴:*\n.pies japan\n.pies korea\n.pies hijab\n.pies random\n\n*✨ 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚂𝙸𝙻𝙰 𝙼𝙳*`
                }, { quoted: msg });
            }

            await sock.sendMessage(from, {
                text: `*🖼️ 𝙶𝙴𝚃𝚃𝙸𝙽𝙶 𝙸𝙼𝙰𝙶𝙴...*\n\n*📂 𝙲𝚊𝚝𝚎𝚐𝚘𝚛𝚢: ${categories[category]}*\n*⏳ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚠𝚊𝚒𝚝...*`
            }, { quoted: msg });

            const apiUrl = `https://shizoapi.onrender.com/api/pies?type=${category}`;
            
            const response = await axios.get(apiUrl, { 
                responseType: 'arraybuffer',
                timeout: 30000 
            });

            const imageBuffer = Buffer.from(response.data, 'binary');

            await sock.sendMessage(from, {
                image: imageBuffer,
                caption: `*🖼️ 𝚁𝙰𝙽𝙳𝙾𝙼 𝙸𝙼𝙰𝙶𝙴 🖼️*\n\n*📂 𝙲𝚊𝚝𝚎𝚐𝚘𝚛𝚢:* ${categories[category]}\n*✨ 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚂𝙸𝙻𝙰 𝙼𝙳*`
            }, { quoted: msg });

        } catch (error) {
            console.error('PIES Error:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `*❌ 𝙸𝙼𝙰𝙶𝙴 𝙴𝚁𝚁𝙾𝚁*\n\n*𝙴𝚛𝚛𝚘𝚛: ${error.message}*\n*𝚃𝚛𝚢 𝚊𝚐𝚊𝚒𝚗 𝚠𝚒𝚝𝚑 𝚊 𝚍𝚒𝚏𝚏𝚎𝚛𝚎𝚗𝚝 𝚌𝚊𝚝𝚎𝚐𝚘𝚛𝚢.*\n\n*✨ 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚂𝙸𝙻𝙰 𝙼𝙳*`
            }, { quoted: msg });
        }
    }
};
