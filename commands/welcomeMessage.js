const data = require('../data.json')

module.exports = {
    name: 'welcomeMessage',
    description: 'Adds welcome message to welcome channel when a new user joins the guild.',
    async execute(member, client){
        const guild = await data.guilds.find(guild => guild.name === member.guild.name)
        if (!guild) return
        const welcomeChannel = await client.channels.fetch(guild.welcomeChannel)
        await welcomeChannel.send(`Hello ${member}, Welcome to ${guild.name} ${guild.welcomeMessage}`)
    }
}