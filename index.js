const Discord = require('discord.js');
const activityRole = require('./commands/activityRole')
const data = require('data.json')
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION" ,"VOICE_STATE_UPDATE"]});

const prefix = '!!';

const fs = require('fs');

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command)
}

client.once('ready', () => {
    console.log('Mr Bot is online!')
})

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command){
        case 'ping':
            client.commands.get("ping").execute(message, args);
            break;

        case 'reactionrole':
            client.commands.get('reactionrolesetup').execute(message, args, Discord);
            break;
    }
})

client.on('voiceStateUpdate', async (oldState, newState) => {
   if (oldState.channel == null && newState != null){
       const runActivity = await new activityRole()
       await runActivity.updateStatus(newState)
   }

})

client.on('messageReactionAdd', async (reaction, user) => {
     await client.commands.get('reactionrole').reactionRoleAdd(reaction, user)
});

client.on('messageReactionRemove', async (reaction, user) => {
    await client.commands.get('reactionrole').reactionRoleRemove(reaction, user)

})


client.login(data.clientToken);