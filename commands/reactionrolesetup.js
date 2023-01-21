const roles = require('../resources/roles').roles
module.exports = {
    name: 'reactionrolesetup',
    description: 'set role based on reaction',
    async execute(message, MessageEmbed) {
        let description = 'These roles are here so that users can lfg using @ for specific games so select the games you ' +
            'would like to be notified for.\n\n'
        await roles.forEach(role => {
            description +=  `|${role.emoji} for ${role.name} Role| \n`
        })
        let embed = new MessageEmbed()
            .setColor('#e42643')
            .setTitle('Select Roles')
            .setDescription(description);
        console.log(embed)
        let messageEmbed = await message.channel.send({embed: [embed]});
        roles.forEach(role => {
            messageEmbed.react(role.emoji)
        })
    }
}