const data = require("../data.json")

module.exports = {
    name: 'streamingMessage',
    async execute(presence){
       const channel = await presence.guild.channels.cache.get(data.streamingChannel)
        channel.send(`@here \n ${presence.member.displayName} is STREAMING NOW! \n ${presence.activities[0].url}`)
    }
}