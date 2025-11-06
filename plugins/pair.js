const axios = require("axios");
const config = require("../config");

// Heroku App URL
const HEROKU_APP_URL = 'https://sila-md-mini-bot.onrender.com';

module.exports = {
  command: "pair",
  desc: "Get pairing code for mini inconnu xd AI bot",
  use: ".pair 653078046968",
  filename: __filename,

  execute: async (socket, msg, args) => {
    const messages = {
      invalid: "*DO YOU WANT SILA MD MINI BOT PAIR CODE 🤔*\n*THEN WRITE LIKE THIS ☺️\n\n*PAIR +255612491554*\n\n*WHEN YOU WRITE LIKE THIS 😇 THEN YOU WILL GET SILA MD MINI BOT PAIR CODE 😃 YOU CAN LOGIN IN YOUR WHATSAPP 😍 YOUR MINI BOT WILL ACTIVATE 🥰*",
      failed: "*PLEASE TRY AGAIN AFTER SOME TIME 🥺❤️*",
      done: "*🐢 SILA MD MINI BOT 🐢*\n*PAIR CODE COMPLETED 😇❤️*",
      error: "*PAIR CODE IS NOT CONNECTING TO YOUR NUMBER ☹️*",
    };

    try {
      // Get sender details
      const senderId = msg.sender || msg.key?.participant || msg.key?.remoteJid || "";
      const senderNumber = senderId.split("@")[0];

      // Use args or fallback
      const phoneNumber = args.length > 0 ? args.join(" ").trim() : "";

      if (!phoneNumber) {
        return socket.sendMessage(
          msg.key?.remoteJid || senderId,
          {
            text: `*𝚂𝙸𝙻𝙰 𝙼𝙳 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃 𝙵𝙾𝚁 𝚈𝙾𝚄𝚁 𝙽𝚄𝙼𝙱𝙴𝚁 ☺️*\n*𝚆𝚁𝙸𝚃𝙴 𝙻𝙸𝙺𝙴 𝚃𝙷𝙸𝚂 😇*\n\n *.𝙿𝙰𝙸𝚁 ❮+255612491554❯*\n\n *𝙸𝙽𝚂𝚃𝙴𝙰𝙳 𝙾𝙵 𝚃𝙷𝙸𝚂 𝙽𝚄𝙼𝙱𝙴𝚁 𝚆𝚁𝙸𝚃𝙴 𝚈𝙾𝚄𝚁 𝙽𝚄𝙼𝙱𝙴𝚁 𝙾𝙺 😊 𝚃𝙷𝙴𝙽 𝚈𝙾𝚄 𝚆𝙸𝙻𝙻 𝙶𝙴𝚃 𝙿𝙰𝙸𝚁𝙸𝙽𝙶 𝙲𝙾𝙳𝙴 😃 𝚈𝙾𝚄 𝙲𝙰𝙽 𝙻𝙾𝙶𝙸𝙽 𝚆𝙸𝚃𝙷 𝚃𝙷𝙰𝚃 𝙿𝙰𝙸𝚁𝙸𝙽𝙶 𝙲𝙾𝙳𝙴 𝙸𝙽 𝚈𝙾𝚄𝚁 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿 😌 𝚃𝙷𝙴𝙽 𝚂𝙸𝙻𝙰 𝙼𝙳 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃 𝚆𝙸𝙻𝙻 𝙰𝙲𝚃𝙸𝚅𝙰𝚃𝙴 𝙾𝙽 𝚈𝙾𝚄𝚁 𝙽𝚄𝙼𝙱𝙴𝚁 😍*`,
          },
          { quoted: msg }
        );
      }

      if (!phoneNumber.match(/^\+?\d{10,15}$/)) {
        return await socket.sendMessage(
          msg.key?.remoteJid || senderId,
          { text: messages.invalid },
          { quoted: msg }
        );
      }

      const baseUrl = `${HEROKU_APP_URL}/code?number=`;
      const response = await axios.get(`${baseUrl}${encodeURIComponent(phoneNumber)}`);

      if (!response.data || !response.data.code) {
        return await socket.sendMessage(
          msg.key?.remoteJid || senderId,
          { text: messages.failed },
          { quoted: msg }
        );
      }

      const pairingCode = response.data.code;

      const otpCaption = `${pairingCode}`;

      await socket.sendMessage(
        msg.key?.remoteJid || senderId,
        { text: otpCaption },
        { quoted: msg }
      );

      await new Promise((r) => setTimeout(r, 2000));
      await socket.sendMessage(
        msg.key?.remoteJid || senderId,
        { text: pairingCode },
        { quoted: msg }
      );
    } catch (error) {
      console.error("Pair command error:", error);
      const senderId = msg.sender || msg.key?.participant || msg.key?.remoteJid || "";
      await socket.sendMessage(
        msg.key?.remoteJid || senderId,
        { text: messages.error },
        { quoted: msg }
      );
    }
  },
};
