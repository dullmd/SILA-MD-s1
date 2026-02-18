const mongoDB = require('./mongoDB');
const config = {};

// Initialize database connection
async function connectdb() {
  try {
    await mongoDB.connectToMongoDB();
    await mongoDB.initializeSettings();
    console.log("✅ Database connected successfully 🛢️");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Update CMD store (Non-Button messages)
async function updateCMDStore(MsgID, CmdID) {
  try {
    return await mongoDB.saveNonButtonMessage(MsgID, CmdID);
  } catch (e) {
    console.log(e);
    return false;
  }
}

// Check if message has button ID
async function isbtnID(MsgID) {
  try {
    return await mongoDB.isButtonMessage(MsgID);
  } catch (e) {
    return false;
  }
}

// Get CMD store
async function getCMDStore(MsgID) {
  try {
    return await mongoDB.getCommandId(MsgID);
  } catch (e) {
    console.log(e);
    return false;
  }
}

// Get command for CMD ID
function getCmdForCmdId(CMD_ID_MAP, cmdId) {
  const result = CMD_ID_MAP.find((entry) => entry.cmdId === cmdId);
  return result ? result.cmd : null;
}

// Update setting
async function input(setting, data) {
  try {
    await mongoDB.updateSetting(setting, data);
    config[setting] = data;
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

// Get setting
async function get(setting) {
  try {
    return await mongoDB.getSetting(setting);
  } catch (e) {
    console.log(e);
    return null;
  }
}

// Update config from database
async function updb() {
  try {
    const settings = await mongoDB.getAllSettings();
    Object.assign(config, settings);
    console.log("✅ Database loaded into config");
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

// Reset to default settings
async function updfb() {
  try {
    await mongoDB.initializeSettings();
    await updb();
    console.log("✅ Database reset to defaults");
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

module.exports = {
  updateCMDStore,
  isbtnID,
  getCMDStore,
  getCmdForCmdId,
  connectdb,
  input,
  get,
  updb,
  updfb,
  config
};
