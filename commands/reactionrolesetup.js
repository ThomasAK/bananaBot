const roles = require('../resources/roles').roles
const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'reactionrolesetup',
    description: 'set role based on reaction',
    async execute(message) {
        let description = 'These roles are here so that users can lfg using @ for specific games so select the games you ' +
            'would like to be notified for.\n\n'
        await roles.forEach(role => {
            description +=  `${role.emoji} ${role.name}  \n`
        })
        let embed = new MessageEmbed()
            .setColor('#e42643')
            .setTitle('Select Roles')
            .setDescription(description);
        console.log(embed)
        let messageEmbed = await message.channel.send({embeds: [embed]});
        roles.forEach(role => {
            messageEmbed.react(role.emoji)
        })
    }
}