const data = require("../data.json")

module.exports = {
    name: 'streamingMessage',
    async execute(presence, Discord){
       const channel = await presence.guild.channels.fetch(data.streamingChannel)
        let embed = new Discord.MessageEmbed()
            .setColor('#e42643')
            .setTitle(`${presence.member.displayName} is STREAMING NOW!`)
            .setDescription(`${presence.activities.details} \n ${presence.activities.url}`)
        channel.send(embed)
    }
}