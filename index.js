const { Client, Intents, Collection} = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS], partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'PRESENCE_UPDATE', 'GUILD_MEMBER'] });
const activityRole =  require('./commands/activityRole')
const runActivity = new activityRole()
const data = require("./data.json")
const removeChannel = require("./commands/removeChannel")

const prefix = '!!';

const fs = require('fs');

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command)
}

client.on('ready', () => {
    console.log('Mr Bot is online!')
})

client.on('messageCreate', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command){
        case 'ping':
            client.commands.get("ping").execute(message);
            break;

        case 'reactionrole':
            client.commands.get('reactionrolesetup').execute(message);
            break;
        case 'timeout':
            const user = args.shift()
            client.commands.get('timeout').execute(message, user.slice(3, user.length - 1))
            break;
        case 'lf':
            client.commands.get('lf').execute(message).then()
            break;
        case 'setinactive':
            client.commands.get('setInactive').execute(message).then()
            break;
        case 'createchannel':
        case 'cc':
            client.commands.get('createChannel').execute(message)
            break;
        case 'play':
        case 'skip':
        case 'leave':
        case 'pause':
        case 'resume':
        case 'clear':
        case 'queue':
            client.commands.get('play').execute(message, args, command)
            break;
    }
})

client.on('voiceStateUpdate', async (oldState, newState) => {
    //if (oldState.channel == null && newState != null) await runActivity.updateStatus(newState)
    if (oldState.guild.name !== data.guilds[0].name || !oldState.channel)return
    if (oldState.channel !== newState.channel) await removeChannel.execute(oldState)
})

client.on('messageReactionAdd', async (reaction, user) => {
     await client.commands.get('reactionrole').reactionRoleAdd(reaction, user)
});

client.on('messageReactionRemove', async (reaction, user) => {
    await client.commands.get('reactionrole').reactionRoleRemove(reaction, user)
})

/*client.on('presenceUpdate', async (oldPresence, newPresence) =>{
    if (!newPresence.activities[0]) return
    let alreadyStreaming = false
    if(oldPresence.hasOwnProperty('activities')){
    oldPresence.activities.forEach(activity => {
        if (activity.type === 'STREAMING') alreadyStreaming = true
    })}
    newPresence.activities.forEach(activity => {
        if(activity.type === 'STREAMING' && !alreadyStreaming )  client.commands.get('streamingMessage').execute(newPresence, activity).then()
    })
})*/

client.on('guildMemberAdd', async member => {
  await client.commands.get('welcomeMessage').execute(member, client)
})

client.login(data.clientToken).then();