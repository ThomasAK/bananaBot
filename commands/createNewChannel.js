const data = require('../data.json')

module.exports = {
    name: 'createChannel',
    description: 'This creates a new channel',
    async execute(message){
        const messageDetails = message.content.split(/ +/)
        if (messageDetails[2] && isNaN(messageDetails[2])) return message.channel.send('No spaces in channel name')
        if (message.guild.channels.cache.find(channel => channel.name === messageDetails[1])) return message.channel.send('Channel name already taken')
        await message.guild.channels.create(messageDetails[1] , {
            type: 'GUILD_VOICE',
            userLimit: messageDetails[2] ? messageDetails[2] : 0,
            bitrate: data.bitrate
        })

        const newChannel = await message.guild.channels.cache.find(channel => channel.name === messageDetails[1])
        await newChannel.setParent(data.guilds[0].gameCategory)
    }
}