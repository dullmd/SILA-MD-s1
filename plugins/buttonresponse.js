const mongoDB = require('../lib/mongoDB');

module.exports = {
  command: "buttonresponse",
  description: "Handle button responses",
  category: "system",
  hideFromMenu: true, // This won't show in menu
  
  async execute(sock, msg, args, userNumber) {
    // This is handled by the main button handler in index.js
    // This plugin is just for structure if needed
  }
};
