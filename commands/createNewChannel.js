const data = require('../data.json')

module.exports = {
    name: 'createChannel',
    description: 'This creates a new channel',
    async execute(message){
        const messageDetails = message.content.split(/ +/)
        let num
        while (message.guild.channels.cache.find(channel => channel.name === messageDetails[1]+num)) {
            num++
        }
        const name = num < 1 ? messageDetails[1] : `${messageDetails[1]}${num}`
        await message.guild.channels.create(name , {
            type: 'GUILD_VOICE',
            userLimit: messageDetails[2] ? messageDetails[2] : 99
        })

        const newChannel =await message.guild.channels.cache.find(channel => channel.name === messageDetails[1]+num)
        await newChannel.setParent(data.guilds[1].gameCategory)
    }
}