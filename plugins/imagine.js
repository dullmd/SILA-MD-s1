const axios = require("axios");

module.exports = {
    command: "imagine",
    alias: ["aiimg", "flux", "fluxai", "aiimage"],
    description: "Generate AI images using multiple providers",
    category: "ai",
    react: "🎨",
    usage: ".imagine [prompt]",
    execute: async (socket, msg, args) => {
        const sender = msg.key.remoteJid;
        const prompt = args.join(" ");

        try {
            // React immediately
            await socket.sendMessage(sender, { react: { text: "⏳", key: msg.key } });

            if (!prompt) {
                await socket.sendMessage(sender, { 
                    text: "*🎨 AI IMAGE GENERATOR*\n\nPlease provide a prompt for the image.\n\n*Example:* .imagine a beautiful sunset over mountains"
                }, { quoted: msg });
                return;
            }

            // Send processing message
            await socket.sendMessage(sender, { 
                text: `*🔄 CREATING IMAGE...*\n\n*Prompt:* ${prompt}\n\nPlease wait while I generate your image...`
            }, { quoted: msg });

            // Try different AI image APIs
            const apis = [
                {
                    name: "Flux AI",
                    url: `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(prompt)}`
                },
                {
                    name: "Stable Diffusion", 
                    url: `https://api.siputzx.my.id/api/ai/stable-diffusion?prompt=${encodeURIComponent(prompt)}`
                },
                {
                    name: "Stability AI",
                    url: `https://api.siputzx.my.id/api/ai/stabilityai?prompt=${encodeURIComponent(prompt)}`
                }
            ];

            let imageBuffer = null;
            let apiUsed = "";

            // Try each API until one works
            for (const api of apis) {
                try {
                    console.log(`Trying ${api.name} API...`);
                    const response = await axios.get(api.url, { 
                        responseType: "arraybuffer",
                        timeout: 30000
                    });

                    if (response.data && response.data.length > 1000) {
                        imageBuffer = Buffer.from(response.data, "binary");
                        apiUsed = api.name;
                        break;
                    }
                } catch (apiError) {
                    console.log(`${api.name} failed:`, apiError.message);
                    continue;
                }
            }

            if (!imageBuffer) {
                await socket.sendMessage(sender, { 
                    text: "*❌ IMAGE GENERATION FAILED*\n\nAll AI services are currently unavailable. Please try again later."
                }, { quoted: msg });
                await socket.sendMessage(sender, { react: { text: "❌", key: msg.key } });
                return;
            }

            // Send the generated image
            await socket.sendMessage(sender, {
                image: imageBuffer,
                caption: `*🎨 AI IMAGE GENERATED*\n\n*Prompt:* ${prompt}\n*Model:* ${apiUsed}\n*Powered by:* SILA MD MINI s1`
            }, { quoted: msg });

            // Success reaction
            await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });

        } catch (error) {
            console.error("Imagine command error:", error);
            
            await socket.sendMessage(sender, { 
                text: `*❌ ERROR*\n\nFailed to generate image:\n${error.message || "Unknown error"}\n\nPlease try again with a different prompt.`
            }, { quoted: msg });
            
            await socket.sendMessage(sender, { react: { text: "❌", key: msg.key } });
        }
    }
};
