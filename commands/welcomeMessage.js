const data = require('../data.json')

module.exports = {
    name: 'welcomeMessage',
    description: 'Adds welcome message to welcome channel when a new user joins the guild.',
    async execute(member, client){
        const welcomeChannel = await client.channels.fetch(data.welcomeChannel)
        await welcomeChannel.send(`Hello ${member}, Welcome to ${member.guild.name} to get started please check out the rules channel under server info, then go select the roles you would like under Voice Channel Access.
        Thank you for joining us we hope you have an amazing gaming experience. If you have any questions or concerns please message a Commander in Chief or a Mod Boss. `)
    }
}