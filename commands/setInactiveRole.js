const dbService =  require('../resources/dbService')

module.exports = {
    name: 'setInactive',
    async execute(message) {
        const db = new dbService()
        const past90Days = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        message.channel.send('finding inactive users')
        function getRole (roleName, member){return member.roles.cache.find(role => role.name === roleName);}

        message.guild.members.cache.map( async member  => {
            if (getRole('Commander in Chief', member) || getRole('Mod Boss', member) || getRole('OG', member) || getRole('Server Booster', member) || getRole('Regular', member)) return
            const count =  await db.getActivityCount(member.id, past90Days.getFullYear() + '-' + (past90Days.getMonth()+1) + '-' + past90Days.getDate())
            const inactiveRole = message.guild.roles.cache.find(role => role.name === 'Inactive')
            if (count < 1) {
                //await member.roles.remove(member.roles.cache);
                console.log(`${member.displayName} has been inactive for longer than 90 days`)
                await member.roles.add(inactiveRole);
            }
            return member
        })
    }
}