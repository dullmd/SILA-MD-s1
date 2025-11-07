const axios = require('axios');

module.exports = {
    command: "play",
    alias: ["song", "music", "mp3", "audio", "ytmusic", "youtubeaudio"],
    desc: "Search and download songs from YouTube as MP3",
    category: "download",
    react: "🎵",
    filename: __filename,

    execute: async (sock, msg, args) => {
        try {
            const from = msg.key.remoteJid;
            const text = args.join(" ").trim();

            if (!text) {
                return await sock.sendMessage(from, {
                    text: `*🎵 𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝙼𝚄𝚂𝙸𝙲 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁 🎵*\n\n*𝙳𝙾 𝚈𝙾𝚄 𝚆𝙰𝙽𝚃 𝚃𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 𝙰 𝚂𝙾𝙽𝙶? 🥺*\n*𝚃𝙷𝙴𝙽 𝚆𝚁𝙸𝚃𝙴 𝙻𝙸𝙺𝙴 𝚃𝙷𝙸𝚂 ☺️*\n\n*🎵 𝙿𝙻𝙰𝚈 ❮𝚂𝙾𝙽𝙶 𝙽𝙰𝙼𝙴❯*\n\n*𝙴𝚇𝙰𝙼𝙿𝙻𝙴𝚂:*\n*• .play shape of you ed sheeran*\n*• .play blinding lights weeknd*\n*• .play as it was harry styles*\n*• .play flowers miley cyrus*\n\n*𝚆𝚁𝙸𝚃𝙴 𝙲𝙾𝙼𝙼𝙰𝙽𝙳 ❮𝙿𝙻𝙰𝚈❯ 𝙰𝙽𝙳 𝚂𝙾𝙽𝙶 𝙽𝙰𝙼𝙴 ☺️*\n*𝚃𝙷𝙴𝙽 𝚈𝙾𝚄 𝚆𝙸𝙻𝙻 𝙶𝙴𝚃 𝚃𝙷𝙴 𝙼𝙿𝟹 𝙵𝙸𝙻𝙴 🎧✨*`
                }, { quoted: msg });
            }

            // Send searching message
            await sock.sendMessage(from, {
                text: `*🔍 𝚂𝙴𝙰𝚁𝙲𝙷𝙸𝙽𝙶 𝙵𝙾𝚁 𝚂𝙾𝙽𝙶...*\n\n*🎵 𝚂𝚘𝚗𝚐: ${text}*\n*⏳ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚠𝚊𝚒𝚝, 𝚜𝚎𝚊𝚛𝚌𝚑𝚒𝚗𝚐 𝚘𝚗 𝚈𝚘𝚞𝚃𝚞𝚋𝚎...*`
            }, { quoted: msg });

            // API URL for YouTube search
            const apiUrl = `https://okatsu-rolezapiiz.vercel.app/search/play?query=${encodeURIComponent(text)}`;
            
            console.log(`🔍 Searching YouTube for song: ${text}`);

            // Make API request
            const response = await axios.get(apiUrl, {
                timeout: 30000 // 30 seconds timeout
            });

            const data = response.data;

            if (!data || data.error) {
                throw new Error(data?.error || 'No song data found');
            }

            // Check if we have results
            if (!data.result || data.result.length === 0) {
                throw new Error('No songs found for your search');
            }

            // Get the first result (most relevant)
            const song = data.result[0];
            
            if (!song.audio) {
                throw new Error('No audio download link available');
            }

            // Send song info first
            const songInfo = `*🎵 𝚂𝙾𝙽𝙶 𝙵𝙾𝚄𝙽𝙳 🎵*\n\n` +
                           `*📛 𝚃𝚒𝚝𝚕𝚎:* ${song.title || 'Unknown'}\n` +
                           `*👤 𝙰𝚛𝚝𝚒𝚜𝚝:* ${song.artist || 'Unknown'}\n` +
                           `*⏱️ 𝙳𝚞𝚛𝚊𝚝𝚒𝚘𝚗:* ${song.duration || 'Unknown'}\n` +
                           `*📊 𝚀𝚞𝚊𝚕𝚒𝚝𝚢:* ${song.quality || 'High'}\n\n` +
                           `*⬇️ 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶 𝙼𝙿𝟹...*`;

            await sock.sendMessage(from, {
                text: songInfo
            }, { quoted: msg });

            // Download and send the audio
            const audioResponse = await axios.get(song.audio, {
                responseType: 'arraybuffer',
                timeout: 60000 // 60 seconds for download
            });

            const audioBuffer = Buffer.from(audioResponse.data, 'binary');

            // Send the audio file
            await sock.sendMessage(from, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${(song.title || 'song').replace(/[^\w\s]/gi, '')}.mp3`,
                caption: `*🎵 𝚂𝙾𝙽𝙶 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝙳 🎵*\n\n` +
                        `*📛 𝚃𝚒𝚝𝚕𝚎:* ${song.title || 'Unknown'}\n` +
                        `*👤 𝙰𝚛𝚝𝚒𝚜𝚝:* ${song.artist || 'Unknown'}\n` +
                        `*⏱️ 𝙳𝚞𝚛𝚊𝚝𝚒𝚘𝚗:* ${song.duration || 'Unknown'}\n\n` +
                        `*🎧 𝙴𝚗𝚓𝚘𝚢 𝚢𝚘𝚞𝚛 𝚖𝚞𝚜𝚒𝚌!*\n` +
                        `*✨ 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚂𝙸𝙻𝙰 𝙼𝙳*`
            }, { quoted: msg });

            console.log(`✅ Song downloaded successfully: ${song.title}`);

        } catch (error) {
            console.error('❌ YouTube Music Download Error:', error);
            
            let errorMessage = '*❌ 𝚂𝙾𝙽𝙶 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 𝙵𝙰𝙸𝙻𝙴𝙳*\n\n';
            
            if (error.response?.status === 404) {
                errorMessage += '*🚫 𝚂𝙾𝙽𝙶 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳*\n*📛 𝙽𝚘 𝚜𝚘𝚗𝚐 𝚏𝚘𝚞𝚗𝚍 𝚏𝚘𝚛 𝚢𝚘𝚞𝚛 𝚜𝚎𝚊𝚛𝚌𝚑. 𝚃𝚛𝚢 𝚊 𝚍𝚒𝚏𝚏𝚎𝚛𝚎𝚗𝚝 𝚜𝚘𝚗𝚐 𝚗𝚊𝚖𝚎.*';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage += '*⏰ 𝚁𝙴𝚀𝚄𝙴𝚂𝚃 𝚃𝙸𝙼𝙴𝙳 𝙾𝚄𝚃*\n*📛 𝚂𝚎𝚊𝚛𝚌𝚑 𝚘𝚛 𝚍𝚘𝚠𝚗𝚕𝚘𝚊𝚍 𝚝𝚘𝚘𝚔 𝚝𝚘𝚘 𝚕𝚘𝚗𝚐. 𝙿𝚕𝚎𝚊𝚜𝚎 𝚝𝚛𝚢 𝚊𝚐𝚊𝚒𝚗.*';
            } else if (error.response?.status === 429) {
                errorMessage += '*📛 𝙰𝙿𝙸 𝙻𝙸𝙼𝙸𝚃 𝙴𝚇𝙲𝙴𝙴𝙳𝙴𝙳*\n*🚫 𝚃𝚘𝚘 𝚖𝚊𝚗𝚢 𝚛𝚎𝚚𝚞𝚎𝚜𝚝𝚜. 𝙿𝚕𝚎𝚊𝚜𝚎 𝚝𝚛𝚢 𝚊𝚐𝚊𝚒𝚗 𝚕𝚊𝚝𝚎𝚛.*';
            } else if (error.message.includes('No audio download link')) {
                errorMessage += '*🔗 𝙽𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 𝙻𝙸𝙽𝙺*\n*📛 𝙰𝚞𝚍𝚒𝚘 𝚍𝚘𝚠𝚗𝚕𝚘𝚊𝚍 𝚕𝚒𝚗𝚔 𝚗𝚘𝚝 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚏𝚘𝚛 𝚝𝚑𝚒𝚜 𝚜𝚘𝚗𝚐.*';
            } else {
                errorMessage += '*🔧 𝚂𝙴𝚁𝚅𝙴𝚁 𝙴𝚁𝚁𝙾𝚁*\n*📛 𝙿𝚕𝚎𝚊𝚜𝚎 𝚝𝚛𝚢 𝚊𝚐𝚊𝚒𝚗 𝚕𝚊𝚝𝚎𝚛 𝚘𝚛 𝚞𝚜𝚎 𝚊 𝚍𝚒𝚏𝚏𝚎𝚛𝚎𝚗𝚝 𝚜𝚘𝚗𝚐.*';
            }

            errorMessage += '\n\n*💡 𝚃𝙸𝙿𝚂 𝙵𝙾𝚁 𝙱𝙴𝚃𝚃𝙴𝚁 𝚂𝙴𝙰𝚁𝙲𝙷:*\n';
            errorMessage += '• 𝚄𝚜𝚎 𝚜𝚘𝚗𝚐 𝚗𝚊𝚖𝚎 + 𝚊𝚛𝚝𝚒𝚜𝚝 𝚗𝚊𝚖𝚎\n';
            errorMessage += '• 𝙲𝚑𝚎𝚌𝚔 𝚜𝚙𝚎𝚕𝚕𝚒𝚗𝚐 𝚘𝚏 𝚜𝚘𝚗𝚐 𝚊𝚗𝚍 𝚊𝚛𝚝𝚒𝚜𝚝\n';
            errorMessage += '• 𝚃𝚛𝚢 𝚙𝚘𝚙𝚞𝚕𝚊𝚛 𝚜𝚘𝚗𝚐𝚜 𝚏𝚒𝚛𝚜𝚝\n';
            errorMessage += '• 𝙰𝚟𝚘𝚒𝚍 𝚜𝚙𝚎𝚌𝚒𝚊𝚕 𝚌𝚑𝚊𝚛𝚊𝚌𝚝𝚎𝚛𝚜\n\n';
            errorMessage += '*🎵 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚂𝙸𝙻𝙰 𝙼𝙳*';

            await sock.sendMessage(msg.key.remoteJid, {
                text: errorMessage
            }, { quoted: msg });
        }
    }
};
