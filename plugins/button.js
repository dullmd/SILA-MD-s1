const mongoDB = require('../lib/mongoDB');

module.exports = {
  command: ['button', 'addbutton', 'listbutton', 'delbutton'],
  
  async execute(socket, msg, args, number) {
    const sender = msg.key.remoteJid;
    const subCommand = args[0]?.toLowerCase();

    // Check if user is owner/admin
    const settings = await mongoDB.getAllSettings();
    const admins = settings.ADMIN_LIST || [];
    const owner = settings.OWNER_NUMBER + '@s.whatsapp.net';
    
    if (sender !== owner && !admins.includes(sender.split('@')[0])) {
      return socket.sendMessage(sender, { 
        text: '❌ This command is only for bot owner and admins!' 
      }, { quoted: msg });
    }

    switch (subCommand) {
      case 'add':
        await addButtonCommand(socket, msg, args.slice(1), number);
        break;
      
      case 'list':
        await listButtonCommands(socket, msg, number);
        break;
      
      case 'del':
        await deleteButtonCommand(socket, msg, args[1], number);
        break;
      
      default:
        await showButtonHelp(socket, msg, number);
    }
  }
};

async function addButtonCommand(socket, msg, args, number) {
  const sender = msg.key.remoteJid;
  
  // Format: .button add <command> <title> | <button1:button1text> | <button2:button2text> | <message>
  const text = args.join(' ');
  const parts = text.split('|').map(p => p.trim());
  
  if (parts.length < 4) {
    return socket.sendMessage(sender, {
      text: '❌ Invalid format!\n\nUsage:\n.button add <command> <title> | <btn1:Btn1Text> | <btn2:Btn2Text> | <message>'
    }, { quoted: msg });
  }

  const command = parts[0].toLowerCase();
  const title = parts[1];
  const buttons = [];
  
  // Parse buttons
  for (let i = 2; i < parts.length - 1; i++) {
    const btnParts = parts[i].split(':');
    if (btnParts.length === 2) {
      buttons.push({
        buttonId: btnParts[0],
        buttonText: btnParts[1]
      });
    }
  }
  
  const message = parts[parts.length - 1];

  const buttonData = {
    message,
    buttons,
    footer: '🐢 SILA MD MINI BOT 🐢',
    header: title
  };

  const success = await mongoDB.saveButtonCommand(command, buttonData);
  
  if (success) {
    await socket.sendMessage(sender, {
      text: `✅ Button command *${command}* added successfully!\n\nButtons: ${buttons.map(b => b.buttonText).join(', ')}`
    }, { quoted: msg });
  } else {
    await socket.sendMessage(sender, {
      text: '❌ Failed to add button command!'
    }, { quoted: msg });
  }
}

async function listButtonCommands(socket, msg, number) {
  const sender = msg.key.remoteJid;
  const commands = await mongoDB.getAllButtonCommands();
  
  if (commands.length === 0) {
    return socket.sendMessage(sender, {
      text: '📭 No button commands found!'
    }, { quoted: msg });
  }

  let listText = '*📋 BUTTON COMMANDS LIST*\n\n';
  commands.forEach((cmd, index) => {
    listText += `${index + 1}. *${cmd.command}*\n`;
    listText += `   Title: ${cmd.header || 'No title'}\n`;
    listText += `   Buttons: ${cmd.buttons.map(b => b.buttonText).join(', ')}\n\n`;
  });
  listText += `\nTotal: ${commands.length} commands`;

  await socket.sendMessage(sender, { text: listText }, { quoted: msg });
}

async function deleteButtonCommand(socket, msg, command, number) {
  const sender = msg.key.remoteJid;
  
  if (!command) {
    return socket.sendMessage(sender, {
      text: '❌ Please specify command to delete!\nUsage: .button del <command>'
    }, { quoted: msg });
  }

  // For deletion, we need to implement a delete method in mongoDB
  // For now, we'll just set it to null
  await mongoDB.saveButtonCommand(command, null);
  
  await socket.sendMessage(sender, {
    text: `✅ Button command *${command}* deleted successfully!`
  }, { quoted: msg });
}

async function showButtonHelp(socket, msg, number) {
  const sender = msg.key.remoteJid;
  
  const helpText = `*🔘 BUTTON COMMANDS HELP*

*Commands:*
1. *.button add <cmd> <title> | <btn1:txt> | <btn2:txt> | <message>*
   - Add new button command
   - Example: *.button add menu WELCOME | hi:Hello | menu:Show Menu | help:Get Help | Welcome to SILA MD!*

2. *.button list*
   - Show all button commands

3. *.button del <command>*
   - Delete a button command

*How to use:*
Just type the command name (e.g., *menu*) and buttons will appear!

*Note:* Button commands work without prefix!`;

  await socket.sendMessage(sender, { text: helpText }, { quoted: msg });
}
