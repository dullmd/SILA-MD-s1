const { cmd } = require('../command');

cmd({
  pattern: "kick",
  react: "👢",
  desc: "Remove a user from the group.",
  category: "group",
  filename: __filename
}, async (conn, m, store, { from, args, isGroup, isBotAdmins, reply }) => {
  if (!isGroup) return reply("❌ Ye command sirf group me use hoti hai!");
  if (!isBotAdmins) return reply("❌ Mujhe admin banao phir me kisi ko remove kar sakta hu!");

  let user;
  if (m.quoted) {
    user = m.quoted.sender;
  } else if (args[0]) {
    user = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
  } else {
    return reply("⚠️ Kisi user ko tag karo ya reply karke likho: .kick");
  }

  await conn.groupParticipantsUpdate(from, [user], "remove");
  await conn.sendMessage(from, { 
    text: `👢 *@${user.split('@')[0]}* ko group se remove kar diya gaya!`, 
    mentions: [user] 
  });
  await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
});
