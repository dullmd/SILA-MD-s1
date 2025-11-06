const fs = require("fs");
const path = require("path");

const SUPPORT_LOG_FILE = path.join(__dirname, "../lib/support-logs.json");
const OWNER_JID = "255612491554@s.whatsapp.net"; // ✅ Your JID

// ✅ Auto-create support logs file if missing
function loadSupportLogs() {
    if (!fs.existsSync(SUPPORT_LOG_FILE)) {
        fs.writeFileSync(SUPPORT_LOG_FILE, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(SUPPORT_LOG_FILE));
}

function saveSupportLogs(data) {
    fs.writeFileSync(SUPPORT_LOG_FILE, JSON.stringify(data, null, 2));
}

// ✅ Anti-spam: stores last request timestamps
let spamTimestamps = {};

function checkSpam(sender) {
    const last = spamTimestamps[sender];
    const now = Date.now();
    if (last && now - last < 10 * 60 * 1000) return true; // 10 minutes
    spamTimestamps[sender] = now;
    return false;
}

// ✅ Ticket ID Generator
function generateTicketID() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

module.exports = {
  command: "help",
  desc: "Send a support request to the bot developer",
  category: "utility",
  use: ".support <your issue>",
  react: "🥺",
  filename: __filename,

  execute: async (socket, msg, args, number) => {
    try {
      const supportLogs = loadSupportLogs();
      const sender = msg.key?.remoteJid || msg.chat;
      const userPushname = msg.pushName || "Unknown";
      const q = args.join(" ").trim();

      if (!q) {
        return await socket.sendMessage(sender, { text: "*ARE YOU FACING ANY PROBLEM WITH ANY COMMAND 🥺* \n *THEN WRITE LIKE THIS ☺️* \n\n *HELP ❮SONG COMMAND NOT WORKING❯*\n*HELP ❮VIDEO COMMAND ERROR❯*\n *HELP ❮ANY PROBLEM YOU HAVE WRITE HERE❯* \n *THEN YOUR REQUEST WILL REACH THE DEVELOPER ☺️* " }, { quoted: msg });
      }

      if (checkSpam(sender)) {
        return await socket.sendMessage(sender, { text: "*YOUR REQUEST HAS REACHED THE OWNER ☺️ YOUR PROBLEM WILL BE SOLVED VERY SOON 😊*" }, { quoted: msg });
      }

      const ticketID = generateTicketID();

      supportLogs[ticketID] = {
        userJid: sender,
        username: userPushname,
        message: q,
        time: new Date().toISOString(),
        status: "open",
      };

      saveSupportLogs(supportLogs);

      const supportText = `
      *🐢 ERROR REQUEST 🐢*
*╭───────────────⭓*
*│🐢 REQUEST ID (#${ticketID})*
*│🐢 USER :❯ ${userPushname}*
*│🐢 NUMBER :❯ wa.me/${sender.split("@")[0]}*
*│🐢 TIME :❯ ${new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })}*
*╰───────────────⭓*
*🐢 ERROR MESSAGE 🐢*
*${q}*

*🐢 SILA MD MINI BOT 🐢*
`.trim();

      await socket.sendMessage(OWNER_JID, {
        text: supportText,
        mentions: [sender]
      });

      await socket.sendMessage(sender, {
        text: `*YOUR REQUEST HAS BEEN SENT 😊 WAIT FOR REPLY ☺️*`,
      }, { quoted: msg });

      await socket.sendMessage(sender, {
        react: { text: "😍", key: msg.key }
      });

    } catch (err) {
      console.error(err);
      await socket.sendMessage(msg.key.remoteJid, {
        text: "⚠️ Failed to send your support request. Please try again later."
      }, { quoted: msg });
    }
  }
};