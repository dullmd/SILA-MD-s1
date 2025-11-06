module.exports = {
  command: 'uptime',
  description: 'Check bot uptime',
  category: 'main',
  react: '⏱️',
  execute: async (socket, msg, args) => {
    const sender = msg.key.remoteJid;

    // Uptime calculation
    const uptime = process.uptime(); // seconds
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const uptimeMessage = `*👑 UPTIME :❯ ${hours}h ${minutes}m ${seconds}s 👑*`;

    await socket.sendMessage(sender, { text: uptimeMessage }, { quoted: msg });
  }
};
