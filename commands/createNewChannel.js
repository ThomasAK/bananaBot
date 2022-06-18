const data = require('../data.json')

module.exports = {
    name: 'createChannel',
    description: 'This creates a new channel',
    execute(message){
        const messageDetails = message.content.split(/ +/)
        message.guild.channels.create(`${messageDetails[1]}`, {
            type: 'GUILD_VOICE',
            userLimit: messageDetails[2] ? messageDetails[2] : 99
        })

        const newChannel = message.guild.channels.cache.find(channel => channel.name === messageDetails[1])
        newChannel.setParent(data.guilds[1].gameCategory).then()
    }
}