const data = require('../data.json')

module.exports = {
    name: 'createChannel',
    description: 'This creates a new channel',
    execute(message){
        const messageDetails = message.content.split(/ +/)
        message.guild.channels.create(`${messageDetails[1]}`, {
            type: 'GUILD_VOICE',
            parentId: data.guilds[1].gameCategory,
            userLimit: messageDetails[2] ? messageDetails[2] : 99
        })
    }
}