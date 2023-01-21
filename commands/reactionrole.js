const roles = require('../resources/roles').roles
const data = require('../data.json')


module.exports = {
    name: 'reactionrole',
    async reactionRoleAdd (reaction, user) {
        const guild = await data.guilds.find(guild => guild.name === reaction.message.guild.name)
        if (!guild) return
        if(!guild.rolesChannel.find(reaction.message.channel.id)) return
        const role = roles.find(role => role.emoji === reaction.emoji.name)
        await reaction.message.guild.members.cache.get(user.id).roles.add(reaction.message.guild.roles.cache.find(r => r.name === role.name))

    },
    async reactionRoleRemove (reaction, user) {
        const guild = await data.guilds.find(guild => guild.name === reaction.message.guild.name)
        if (!guild) return
        if(!guild.rolesChannel.find(reaction.message.channel.id)) return
        const role = roles.find(role => role.emoji === reaction.emoji.name)
        await reaction.message.guild.members.cache.get(user.id).roles.remove(reaction.message.guild.roles.cache.find(r => r.name === role.name))
    }
}