const roles = require('../resources/roles').roles
module.exports = {
    name: 'reactionrolesetup',
    description: 'set role based on reaction',
    async execute(message, MessageEmbed) {
        let description = 'These roles will give you access to the different channels we have and will make it so you get pinged when people are lfg for that game.\n\n'
        roles.forEach(role => {
            description +=  `|${role.emoji} for ${role.name} Role| \n`
        })
        let embed = new MessageEmbed()
            .setColor('#e42643')
            .setTitle('Select Roles')
            .setDescription(description)
        let messageEmbed = await message.channel.send(embed);
        roles.forEach(role => {
            messageEmbed.react(role.emoji)
        })
    }
}