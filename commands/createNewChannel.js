const data = require('../data.json')

module.exports = {
    name: 'createChannel',
    description: 'This creates a new channel',
    async execute(message){
        const currentGuild = await data.guilds.find(guild => guild.name === message.guild.name)
        const messageDetails = message.content.split(/ +/)
        if (messageDetails[2] && isNaN(messageDetails[2])) return message.channel.send('No spaces in channel name')
        if (message.guild.channels.cache.find(channel => channel.name === messageDetails[1])) return message.channel.send('Channel name already taken')
        await message.guild.channels.create(messageDetails[1] , {
            type: 'GUILD_VOICE',
            userLimit: messageDetails[2] ? messageDetails[2] : 0,
            bitrate: data.bitrate
        })

        const newChannel = await message.guild.channels.cache.find(channel => channel.name === messageDetails[1])
        console.log(currentGuild.gameCategory)
        await newChannel.setParent(currentGuild.gameCategory)

        let result = false;
        const timeout = function (sec){
            return new Promise(function (_, reject){
                setTimeout(function (){
                   reject(new Error('No one joined the channel within 15 seconds'))
                }, sec*1000)
            })
        }

        const waitForPlayer = function () {
                const poll  = resolve => {
                    if (newChannel.members.size > 0) {
                        result = true;
                        resolve()
                    }
                    else setTimeout(_ => poll(resolve), 400)
                }
                return new Promise(poll)
            }

        Promise.race([timeout(15), waitForPlayer()]).then(res => {
            console.log(result)
            if (!result) newChannel.delete('channel empty')
        })

    }
}