const date = new Date();
const today = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate()
const dbService =  require('../resources/dbService')
const db = new dbService()

class activityRole {

    async updateStatus(state) {
        const adminRole = state.member.roles.cache.find(role => role.name === 'Commander in Chief')
        const bossRole = state.member.roles.cache.find(role => role.name === 'Mod Boss')
        const boosterRole = state.member.roles.cache.find(role => role.name === 'Server Booster')
        const ogRole = state.member.roles.cache.find(role => role.name === 'OG')
        if (adminRole || bossRole || boosterRole || ogRole) return

        const activeToday = await db.getActivityCount(state.id, today)
        if (activeToday[0].activityCount !== 0 ) return

        await db.addUserActivity(state.id);
        const past42Days = new Date(Date.now() - 43 * 24 * 60 * 60 * 1000)
        const count = await db.getActivityCount(state.id, past42Days.getFullYear() + '-' + (past42Days.getMonth()+1) + '-' + past42Days.getDate())

        const activityRole = state.guild.roles.cache.find(role => role.name === 'Regular')
        if (!await state.member.roles.cache.find(r => r.name === 'Regular')) {
            if (count[0].activityCount > 18) {
                await state.member.roles.add(activityRole);
                const dm = await state.member.createDM()
                await dm.send('Congratulations with how active you have been in ' + state.guild.name
                    +' you have been given the role Regular.  You can now invite new members to the Server and have been given access to the OG channels');
            }
        }else {
            if(count[0].activityCount < 9){
                await state.member.roles.remove(activityRole);
                const dm = await state.member.createDM()
                await dm.send('Due to your low activity in '+ state.guild.name + " the role Regular has been removed.")
            }
        }

    }

}

module.exports = activityRole