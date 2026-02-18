const mongoose = require('mongoose');
const { Schema } = mongoose;

// MongoDB connection URL
const MONGODB_URI = 'mongodb+srv://sila_md:sila0022@sila.67mxtd7.mongodb.net/sila_md_bot?retryWrites=true&w=majority';

// Connection state
let isConnected = false;

// Connect to MongoDB
async function connectToMongoDB() {
  if (isConnected) return;
  
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    throw error;
  }
}

// Session Schema
const SessionSchema = new Schema({
  number: { type: String, required: true, unique: true },
  creds: { type: Object, required: true },
  config: { type: Object, default: {} },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Settings Schema
const SettingsSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
});

// Non-Button Messages Schema
const NonButtonSchema = new Schema({
  msgId: { type: String, required: true, unique: true },
  cmdId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Contacts Schema
const ContactSchema = new Schema({
  jid: { type: String, required: true, unique: true },
  name: String,
  lastSeen: Date,
  isBlocked: { type: Boolean, default: false }
});

// Button Commands Schema
const ButtonCommandSchema = new Schema({
  command: { type: String, required: true, unique: true },
  message: { type: String, required: true },
  buttons: [{
    buttonId: String,
    buttonText: String,
    type: { type: String, default: 'reply' }
  }],
  footer: String,
  header: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create models
const Session = mongoose.model('Session', SessionSchema);
const Settings = mongoose.model('Settings', SettingsSchema);
const NonButton = mongoose.model('NonButton', NonButtonSchema);
const Contact = mongoose.model('Contact', ContactSchema);
const ButtonCommand = mongoose.model('ButtonCommand', ButtonCommandSchema);

// Initialize default settings
async function initializeSettings() {
  const defaultSettings = {
    LANG: 'EN',
    ANTI_BAD: [],
    MAX_SIZE: 100,
    ONLY_GROUP: false,
    ANTI_LINK: [],
    ANTI_BOT: [],
    ALIVE: 'default',
    FOOTER: '𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚂𝙸𝙻𝙰 𝙼𝙳',
    LOGO: 'https://files.catbox.moe/90i7j4.png',
    WELCOME: 'true',
    AUTO_VIEW_STATUS: 'true',
    AUTO_VOICE: 'true',
    AUTO_LIKE_STATUS: 'true',
    AUTO_RECORDING: 'true',
    AUTO_LIKE_EMOJI: ['🥹', '👍', '😍', '💗', '🎈', '🎉', '🥳', '😎', '🚀', '🔥'],
    PREFIX: '.',
    MAX_RETRIES: 3,
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/IdGNaKt80DEBqirc2ek4ks',
    ADMIN_LIST: [],
    RCD_IMAGE_PATH: 'https://files.catbox.moe/jwmx1j.jpg',
    NEWSLETTER_JID: '120363422610520277@newsletter',
    NEWSLETTER_MESSAGE_ID: '428',
    OTP_EXPIRY: 300000,
    OWNER_NUMBER: '255612491554',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbBPxQTJUM2WCZLB6j28'
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await Settings.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    );
  }
  console.log('✅ Default settings initialized');
}

// Session management functions
async function saveSession(number, creds) {
  try {
    await connectToMongoDB();
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    
    await Session.findOneAndUpdate(
      { number: sanitizedNumber },
      { 
        number: sanitizedNumber,
        creds,
        lastActive: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log(`✅ Session saved for ${sanitizedNumber}`);
    return true;
  } catch (error) {
    console.error('❌ Error saving session:', error);
    return false;
  }
}

async function getSession(number) {
  try {
    await connectToMongoDB();
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const session = await Session.findOne({ number: sanitizedNumber });
    return session ? session.creds : null;
  } catch (error) {
    console.error('❌ Error getting session:', error);
    return null;
  }
}

async function getAllSessions() {
  try {
    await connectToMongoDB();
    const sessions = await Session.find({});
    return sessions.map(s => s.number);
  } catch (error) {
    console.error('❌ Error getting all sessions:', error);
    return [];
  }
}

async function deleteSession(number) {
  try {
    await connectToMongoDB();
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    await Session.findOneAndDelete({ number: sanitizedNumber });
    console.log(`✅ Session deleted for ${sanitizedNumber}`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting session:', error);
    return false;
  }
}

// Settings management functions
async function updateSetting(setting, value) {
  try {
    await connectToMongoDB();
    await Settings.findOneAndUpdate(
      { key: setting },
      { key: setting, value, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    return true;
  } catch (error) {
    console.error('❌ Error updating setting:', error);
    return false;
  }
}

async function getSetting(setting) {
  try {
    await connectToMongoDB();
    const doc = await Settings.findOne({ key: setting });
    return doc ? doc.value : null;
  } catch (error) {
    console.error('❌ Error getting setting:', error);
    return null;
  }
}

async function getAllSettings() {
  try {
    await connectToMongoDB();
    const settings = await Settings.find({});
    const config = {};
    settings.forEach(s => {
      config[s.key] = s.value;
    });
    return config;
  } catch (error) {
    console.error('❌ Error getting all settings:', error);
    return {};
  }
}

// Non-Button messages functions
async function saveNonButtonMessage(msgId, cmdId) {
  try {
    await connectToMongoDB();
    await NonButton.findOneAndUpdate(
      { msgId },
      { msgId, cmdId },
      { upsert: true, new: true }
    );
    return true;
  } catch (error) {
    console.error('❌ Error saving non-button message:', error);
    return false;
  }
}

async function isButtonMessage(msgId) {
  try {
    await connectToMongoDB();
    const doc = await NonButton.findOne({ msgId });
    return !!doc;
  } catch (error) {
    console.error('❌ Error checking button message:', error);
    return false;
  }
}

async function getCommandId(msgId) {
  try {
    await connectToMongoDB();
    const doc = await NonButton.findOne({ msgId });
    return doc ? doc.cmdId : null;
  } catch (error) {
    console.error('❌ Error getting command ID:', error);
    return null;
  }
}

// Button commands functions
async function saveButtonCommand(command, data) {
  try {
    await connectToMongoDB();
    await ButtonCommand.findOneAndUpdate(
      { command },
      { 
        command,
        ...data,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    return true;
  } catch (error) {
    console.error('❌ Error saving button command:', error);
    return false;
  }
}

async function getButtonCommand(command) {
  try {
    await connectToMongoDB();
    return await ButtonCommand.findOne({ command });
  } catch (error) {
    console.error('❌ Error getting button command:', error);
    return null;
  }
}

async function getAllButtonCommands() {
  try {
    await connectToMongoDB();
    return await ButtonCommand.find({});
  } catch (error) {
    console.error('❌ Error getting all button commands:', error);
    return [];
  }
}

// Contacts functions
async function saveContact(jid, name) {
  try {
    await connectToMongoDB();
    await Contact.findOneAndUpdate(
      { jid },
      { jid, name, lastSeen: new Date() },
      { upsert: true, new: true }
    );
    return true;
  } catch (error) {
    console.error('❌ Error saving contact:', error);
    return false;
  }
}

async function getContacts() {
  try {
    await connectToMongoDB();
    return await Contact.find({});
  } catch (error) {
    console.error('❌ Error getting contacts:', error);
    return [];
  }
}

// Auto reconnect function
async function autoReconnectFromMongoDB() {
  try {
    await connectToMongoDB();
    const numbers = await getAllSessions();
    
    console.log(`✅ Found ${numbers.length} sessions for auto-reconnect`);

    for (const number of numbers) {
      if (!activeSockets?.has(number)) {
        try {
          console.log(`🔁 Attempting to reconnect: ${number}`);
          const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };
          await EmpirePair(number, mockRes);
          console.log(`✅ Successfully reconnected: ${number}`);
          await delay(3000);
        } catch (pairError) {
          console.log(`❌ Failed to reconnect ${number}:`, pairError.message);
        }
      }
    }
  } catch (error) {
    console.log('❌ Auto-reconnect failed:', error.message);
  }
}

module.exports = {
  connectToMongoDB,
  initializeSettings,
  saveSession,
  getSession,
  getAllSessions,
  deleteSession,
  updateSetting,
  getSetting,
  getAllSettings,
  saveNonButtonMessage,
  isButtonMessage,
  getCommandId,
  saveButtonCommand,
  getButtonCommand,
  getAllButtonCommands,
  saveContact,
  getContacts,
  autoReconnectFromMongoDB
};
