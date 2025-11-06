module.exports = {
  command: "ping",
  desc: "Check bot response time",
  category: "utility",
  use: ".ping",
  fromMe: false,
  filename: __filename,

  execute: async (sock, msg) => {
    const start = Date.now();
    await sock.sendMessage(msg.key.remoteJid, { text: "*GG...🥺*" });
    const latency = Date.now() - start;
    
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `*PONG...😊*` 
    }, { quoted: msg });
  }
};
