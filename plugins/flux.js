const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    command: "flux2",
    alias: ["fluximg", "aiimg", "generate", "imgai"],
    desc: "Generate AI images using FLUX model",
    category: "ai",
    react: "🎨",
    filename: __filename,

    execute: async (sock, msg, args) => {
        try {
            const from = msg.key.remoteJid;
            const text = args.join(" ").trim();

            if (!text) {
                return await sock.sendMessage(from, {
                    text: `*🎨 𝙵𝙻𝚄𝚇 𝙰𝙸 𝙸𝙼𝙰𝙶𝙴 𝙶𝙴𝙽𝙴𝚁𝙰𝚃𝙾𝚁 🎨*\n\n*𝙳𝙾 𝚈𝙾𝚄 𝚆𝙰𝙽𝚃 𝚃𝙾 𝙶𝙴𝙽𝙴𝚁𝙰𝚃𝙴 𝙰𝙽 𝙰𝙸 𝙸𝙼𝙰𝙶𝙴? 🥺*\n*𝚃𝙷𝙴𝙽 𝚆𝚁𝙸𝚃𝙴 𝙻𝙸𝙺𝙴 𝚃𝙷𝙸𝚂 ☺️*\n\n*🎨 𝙵𝙻𝚄𝚇 ❮𝚈𝙾𝚄𝚁 𝙸𝙼𝙰𝙶𝙴 𝙿𝚁𝙾𝙼𝙿𝚃❯*\n\n*𝚆𝚁𝙸𝚃𝙴 𝙲𝙾𝙼𝙼𝙰𝙽𝙳 ❮𝙵𝙻𝚄𝚇❯ 𝙰𝙽𝙳 𝚈𝙾𝚄𝚁 𝙸𝙼𝙰𝙶𝙴 𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝚃𝙸𝙾𝙽 ☺️*\n*𝚃𝙷𝙴𝙽 𝙰𝙸 𝚆𝙸𝙻𝙻 𝙶𝙴𝙽𝙴𝚁𝙰𝚃𝙴 𝙰 𝙱𝙴𝙰𝚄𝚃𝙸𝙵𝚄𝙻 𝙸𝙼𝙰𝙶𝙴 𝙵𝙾𝚁 𝚈𝙾𝚄 🎨✨*`
                }, { quoted: msg });
            }

            // Send processing message
            await sock.sendMessage(from, {
                text: `*🔄 𝙶𝙴𝙽𝙴𝚁𝙰𝚃𝙸𝙽𝙶 𝙸𝙼𝙰𝙶𝙴...*\n\n*📝 𝙿𝚛𝚘𝚖𝚙𝚝: ${text}*\n*⏳ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚠𝚊𝚒𝚝, 𝚝𝚑𝚒𝚜 𝚖𝚊𝚢 𝚝𝚊𝚔𝚎 𝚊 𝚏𝚎𝚠 𝚜𝚎𝚌𝚘𝚗𝚍𝚜...*`
            }, { quoted: msg });

            // API URL
            const apiUrl = `https://api.bk9.dev/ai/fluximg?q=${encodeURIComponent(text)}`;
            
            console.log(`🔄 Generating FLUX image for prompt: ${text}`);

            // Make API request
            const response = await axios.get(apiUrl, {
                responseType: 'arraybuffer',
                timeout: 60000 // 60 seconds timeout
            });

            if (!response.data) {
                throw new Error('No image data received from API');
            }

            // Convert to buffer
            const imageBuffer = Buffer.from(response.data, 'binary');

            // Send the generated image
            await sock.sendMessage(from, {
                image: imageBuffer,
                caption: `*🎨 𝙵𝙻𝚄𝚇 𝙰𝙸 𝙸𝙼𝙰𝙶𝙴 𝙶𝙴𝙽𝙴𝚁𝙰𝚃𝙴𝙳 🎨*\n\n*📝 𝙿𝚛𝚘𝚖𝚙𝚝:* ${text}\n*🖼️ 𝙼𝚘𝚍𝚎𝚕:* FLUX AI\n*✨ 𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝙱𝚢 𝚂𝙸𝙻𝙰 𝙼𝙳*`,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363422610520277@newsletter',
                        newsletterName: '🎨 𝚂𝙸𝙻𝙰 𝙼𝙳 𝙰𝙸 🎨',
                        serverMessageId: 143
                    }
                }
            }, { quoted: msg });

            console.log(`✅ FLUX image generated successfully for: ${text}`);

        } catch (error) {
            console.error('❌ FLUX Image Generation Error:', error);
            
            let errorMessage = '*❌ 𝙸𝙼𝙰𝙶𝙴 𝙶𝙴𝙽𝙴𝚁𝙰𝚃𝙸𝙾𝙽 𝙵𝙰𝙸𝙻𝙴𝙳*\n\n';
            
            if (error.response?.status === 429) {
                errorMessage += '*📛 𝙰𝙿𝙸 𝙻𝙸𝙼𝙸𝚃 𝙴𝚇𝙲𝙴𝙴𝙳𝙴𝙳*\n*🚫 𝚃𝚘𝚘 𝚖𝚊𝚗𝚢 𝚛𝚎𝚚𝚞𝚎𝚜𝚝𝚜. 𝙿𝚕𝚎𝚊𝚜𝚎 𝚝𝚛𝚢 𝚊𝚐𝚊𝚒𝚗 𝚕𝚊𝚝𝚎𝚛.*';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage += '*⏰ 𝚁𝙴𝚀𝚄𝙴𝚂𝚃 𝚃𝙸𝙼𝙴𝙳 𝙾𝚄𝚃*\n*📛 𝙸𝚖𝚊𝚐𝚎 𝚐𝚎𝚗𝚎𝚛𝚊𝚝𝚒𝚘𝚗 𝚝𝚘𝚘𝚔 𝚝𝚘𝚘 𝚕𝚘𝚗𝚐. 𝚃𝚛𝚢 𝚊 𝚜𝚒𝚖𝚙𝚕𝚎𝚛 𝚙𝚛𝚘𝚖𝚙𝚝.*';
            } else if (error.response?.status === 400) {
                errorMessage += '*🚫 𝙸𝙽𝚅𝙰𝙻𝙸𝙳 𝙿𝚁𝙾𝙼𝙿𝚃*\n*📛 𝚈𝚘𝚞𝚛 𝚙𝚛𝚘𝚖𝚙𝚝 𝚖𝚊𝚢 𝚌𝚘𝚗𝚝𝚊𝚒𝚗 𝚒𝚗𝚊𝚙𝚙𝚛𝚘𝚙𝚛𝚒𝚊𝚝𝚎 𝚌𝚘𝚗𝚝𝚎𝚗𝚝.*';
            } else {
                errorMessage += '*🔧 𝚂𝙴𝚁𝚅𝙴𝚁 𝙴𝚁𝚁𝙾𝚁*\n*📛 𝙿𝚕𝚎𝚊𝚜𝚎 𝚝𝚛𝚢 𝚊𝚐𝚊𝚒𝚗 𝚕𝚊𝚝𝚎𝚛 𝚘𝚛 𝚞𝚜𝚎 𝚊 𝚍𝚒𝚏𝚏𝚎𝚛𝚎𝚗𝚝 𝚙𝚛𝚘𝚖𝚙𝚝.*';
            }

            errorMessage += '\n\n*💡 𝚃𝙸𝙿𝚂:*\n• 𝚄𝚜𝚎 𝚌𝚕𝚎𝚊𝚛, 𝚍𝚎𝚜𝚌𝚛𝚒𝚙𝚝𝚒𝚟𝚎 𝚙𝚛𝚘𝚖𝚙𝚝𝚜\n• 𝙰𝚟𝚘𝚒𝚍 𝚜𝚎𝚗𝚜𝚒𝚝𝚒𝚟𝚎 𝚌𝚘𝚗𝚝𝚎𝚗𝚝\n• 𝚃𝚛𝚢 𝚜𝚑𝚘𝚛𝚝𝚎𝚛 𝚙𝚛𝚘𝚖𝚙𝚝𝚜\n\n*🎨 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚂𝙸𝙻𝙰 𝙼𝙳*';

            await sock.sendMessage(msg.key.remoteJid, {
                text: errorMessage
            }, { quoted: msg });
        }
    }
};
