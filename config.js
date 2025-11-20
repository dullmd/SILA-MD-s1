const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({
    path: './config.env'
});

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    LANG: 'en',
    WELCOME: 'true',
    
    // Auto Settings
    AUTO_VIEW_STATUS: 'true',        // ✅ auto read status
    AUTO_TYPING: 'false',             // ✅ auto typing
    AUTO_RECORDING: 'true',         // ✅ auto recording
    AUTO_REACT_STATUS: 'true',       // ✅ auto reacts
    AUTO_LIKE_STATUS: 'true',        // legacy auto like
    AUTO_LIKE_EMOJI: ['💥','👍','😍','💗','🎈','🎉','🥳','😎','🚀','🔥'],
    
    ALWAYS_ONLINE: 'false',          // ✅ always online mode
    
    PREFIX: '.',                      // command prefix
    OWNER_NAME: 'SILA',             // ✅ owner name
    OWNER_NUMBER: '255612491554',     // ✅ owner number

    HEROKU_APP_URL: 'https://sila-md-mini-bot-hgpz.onrender.com',
    MAX_RETRIES: 3,
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/IdGNaKt80DEBqirc2ek4ks',
    ADMIN_LIST_PATH: './lib/admin.json',
    RCD_IMAGE_PATH: 'https://files.catbox.moe/jwmx1j.jpg',
    NEWSLETTER_JID: '120363422610520277@newsletter',
    NEWSLETTER_MESSAGE_ID: '428',
    OTP_EXPIRY: 300000,
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbBPxQTJUM2WCZLB6j28'
};
