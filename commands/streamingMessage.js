const data = require("../data.json")

module.exports = {
    name: 'streamingMessage',
    async execute(presence, activity){
        if (presence.member.voice.guild.name !== data.guilds[0].name) return
       const channel = await presence.guild.channels.cache.get(data.guilds[0].streamingChannel)
        channel.send(`@here \n ${presence.member.displayName} is STREAMING ${activity.details} NOW! \n ${activity.url}`)
    }
}