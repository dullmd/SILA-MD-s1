// 🌟 Code by sila
const { cmd } = require('../command');

cmd({
    pattern: "demote",
    alias: ["d", "dismiss", "removeadmin", "dmt"],
    desc: "Demotes a group admin to a normal member",
    category: "admin",
    react: "🥺",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, q, isGroup, sender, botNumber, isBotAdmins, isAdmins, reply
}) => {

    // 🥺 react on command start
    await conn.sendMessage(from, { react: { text: "🥺", key: m.key } });

    // ⚠️ Group check
    if (!isGroup) {
        await conn.sendMessage(from, { react: { text: "😫", key: m.key } });
        return reply("*THIS COMMAND CAN ONLY BE USED IN GROUPS ☺️❤️*");
    }

    // 👮 User admin check
    if (!isAdmins) {
        await conn.sendMessage(from, { react: { text: "😥", key: m.key } });
        return reply("*THIS COMMAND CAN ONLY BE USED BY GROUP ADMINS 🥺*");
    }

    // 🤖 Bot admin check
    if (!isBotAdmins) {
        await conn.sendMessage(from, { react: { text: "😎", key: m.key } });
        return reply("*FIRST MAKE ME ADMIN IN THIS GROUP ☺️❤️*");
    }

    // 🧩 Number detection
    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0];
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, '');
    } else {
        await conn.sendMessage(from, { react: { text: "🥺", key: m.key } });
        return reply(`*WHICH ADMIN DO YOU WANT TO DISMISS 🥺* 
*MENTION THAT ADMIN OR REPLY TO THEIR MESSAGE ☺️* 
*THEN WRITE 🥺👇*

*❮DEMOTE❯*

*THAT ADMIN WILL BE REMOVED FROM ADMIN POSITION 😇🌹*`);
    }

    if (number === botNumber) {
        await conn.sendMessage(from, { react: { text: "😔", key: m.key } });
        return reply("*SORRY, YOU CAN'T REMOVE ME FROM ADMIN 🥺❤️*");
    }

    const jid = number + "@s.whatsapp.net";

    try {
        // 👇 Demote user
        await conn.groupParticipantsUpdate(from, [jid], "demote");

        await conn.sendMessage(from, { react: { text: "☹️", key: m.key } });
        reply(`*+${number} HAS BEEN DISMISSED FROM ADMIN 🥺💔*`, { mentions: [jid] });

    } catch (error) {
        console.error("❌ DEMOTE ERROR:", error);
        await conn.sendMessage(from, { react: { text: "😔", key: m.key } });
        reply("*PLEASE TRY AGAIN 🥺❤️*");
    }
});