const data = require("../data.json")

module.exports = {
    name: 'streamingMessage',
    async execute(presence, activity){
        if (!presence.member.voice.guild.equals(presence.guild)) return
       const channel = await presence.guild.channels.cache.get(data.streamingChannel)
        channel.send(`@here \n ${presence.member.displayName} is STREAMING ${activity.details} NOW! \n ${activity.url}`)
    }
}