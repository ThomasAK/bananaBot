const dbService =  require('../resources/dbService')

class SetInactiveRole {
    async execute(message) {
        const db = new dbService()
        const past90Days = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        message.channel.send('finding inactive users')
        function getRole (roleName){return member.roles.cache.find(role => role.name === roleName);}

        for (const member of message.guild.members.cache ){
            if (getRole('Commander in Chief') || getRole('Mod Boss') || getRole('OG') || getRole('Server Booster') || getRole('Regular')) return
            console.log(member.displayName)
            const count = await db.getActivityCount(member.id, past90Days.getFullYear() + '-' + (past90Days.getMonth()+1) + '-' + past90Days.getDate())
            console.log(count)
            const inactiveRole = message.guild.roles.cache.find(role => role.name === 'Inactive')
            if (count < 1) {
                //await member.roles.remove(member.roles.cache);
                await member.roles.add(inactiveRole);
            }
        }
    }
}

module.exports = {
    name: 'setInactive',
    setInactiveRole: new SetInactiveRole
}