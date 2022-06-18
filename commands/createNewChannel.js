const data = require('../data.json')

module.exports = {
    name: 'createChannel',
    description: 'This creates a new channel',
    async execute(message){
        const messageDetails = message.content.split(/ +/)
        while (message.guild.channels.cache.find(channel => channel.name === messageDetails[1])) {
            messageDetails[1] += 1
        }
        await message.guild.channels.create(`${messageDetails[1]}`, {
            type: 'GUILD_VOICE',
            userLimit: messageDetails[2] ? messageDetails[2] : 99
        })

        const newChannel =await message.guild.channels.cache.find(channel => channel.name === messageDetails[1])
        await newChannel.setParent(data.guilds[1].gameCategory)
    }
}