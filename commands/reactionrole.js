const roles = require('../resources/roles').roles
const data = require('../data.json')


module.exports = {
    name: 'reactionrole',
    reactionRoleAdd: async (reaction, user) => {
        if(reaction.message.channel.id !== data.channelID) return

        roles.forEach(role => {
            if (role.emoji === reaction.emoji.name){
                reaction.message.guild.members.cache.get(user.id).roles.add(reaction.message.guild.roles.cache.find(r => r.name === role.name))
            }
        })
    },
    reactionRoleRemove: async (reaction, user) =>{
        if(reaction.message.channel.id !== data.channelID) return

        roles.forEach(role => {
            if (role.emoji === reaction.emoji.name){
                reaction.message.guild.members.cache.get(user.id).roles.remove(reaction.message.guild.roles.cache.find(r => r.name === role.name))
            }
        })
    }
}