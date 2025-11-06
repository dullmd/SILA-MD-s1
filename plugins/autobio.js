const { default: axios } = require('axios');

// 🌟 Auto Bio Updater — Mini Bot Style
module.exports = {
  command: 'autobio',
  alias: ['bioauto', 'setautobio'],
  description: 'Auto bio update system (on/off)',
  category: 'owner',
  react: '🥺',
  usage: '.autobio on/off',
  
  execute: async (socket, msg, args) => {
    const sender = msg.key.remoteJid;
    const state = args[0]?.toLowerCase();

    // 🥺 Reaction
    await socket.sendMessage(sender, { react: { text: "😎", key: msg.key } });

    // ✅ Sirf owner use kar sakta hai
    if (!msg.key.fromMe) {
      return await socket.sendMessage(sender, {
        text: "*THIS COMMAND IS ONLY FOR ME 😎*"
      }, { quoted: msg });
    }

    // ❓ Agar koi state na di ho
    if (!state || !["on", "off"].includes(state)) {
      return await socket.sendMessage(sender, {
        text: `*BY TURNING ON AUTOBIO 🥺 YOUR WHATSAPP BIO WILL AUTO UPDATE 🥰*\n*YOU CAN ALSO TURN IT OFF 😇*\n\n*WRITE LIKE THIS ☺️👇*\n*❮AUTOBIO ON❯*\n*❮AUTOBIO OFF❯*\n\n*CURRENTLY YOUR AUTOBIO IS ${global.autoBio ? "ON" : "OFF"} ☺️*`
      }, { quoted: msg });
    }

    // 🔧 Set autobio mode
    global.autoBio = state === "on";

    // 🕐 Start updating if ON
    if (state === "on") updateBio(socket);

    await socket.sendMessage(sender, { react: { text: "😍", key: msg.key } });
    await socket.sendMessage(sender, {
      text: `*AUTO BIO AB ${state.toUpperCase()} *ALREADY DONE ☺️*`
    }, { quoted: msg });
  }
};

// 🕐 Function to update bio every 1 min
async function updateBio(socket) {
  if (!global.autoBio) return;

  try {
    const uptime = process.uptime();
    const muptime = clockString(uptime * 1000);
    const botname = global.config?.botname || "SILA-MD";

    const bio = `👑 ${botname} ACTIVE (${muptime}) 👑`;
    await socket.updateProfileStatus(bio);
    console.log(`✅ ${botname} BIO UPDATED: ${bio}`);
  } catch (err) {
    console.error("⚠️ Failed to update bio:", err.message);
  }

  // 🔁 1 minute ke baad phir se
  setTimeout(() => updateBio(socket), 60 * 1000);
}

// ⏱️ Time Converter
function clockString(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor(ms / 3600000) % 24;
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  let str = "";
  if (d) str += `${d}D `;
  if (h) str += `${h}H `;
  if (m) str += `${m}M `;
  if (s) str += `${s}S`;
  return str.trim();
}
