const date = new Date();
const today = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate()
const yesterday = new Date(Date.now() - (24 * 60 * 60 * 1000))
const dbService =  require('../resources/dbService')
const db = new dbService()

class activityRole {

    async updateStatus(state) {
        const adminRole = state.member.roles.cache.find(role => role.name === 'Commander in Chief')
        const bossRole = state.member.roles.cache.find(role => role.name === 'Mod Boss')
        const boosterRole = state.member.roles.cache.find(role => role.name === 'Server Booster')
        const ogRole = state.member.roles.cache.find(role => role.name === 'OG')

        if (adminRole || bossRole || boosterRole || ogRole) return

        let user = await db.getUser(state.id)
        if (!user){
            await db.addUser(state.id);
            return;
        }
        if (user.lastActivity > yesterday) return

        let weeks = [{
                date: user.week1,
                count: user.first
            },
            {
                date: user.week2,
                count: user.second
            },
            {
                date: user.week3,
                count: user.third
            },
            {
                date: user.week4,
                count: user.forth
            },
            {
                date: user.week5,
                count: user.fifth
            },
            {
                date: user.week6,
                count: user.sixth
            }
        ]

        for (let i = 0; i < 6; i++) {
            const dateCheck = new Date(Date.now() - (7 +(7 * i)) * 24 * 60 * 60 * 1000)
            if (weeks[i].date < dateCheck) {
                weeks.splice(i,0, {
                    date: new Date(Date.now() - ((7*i) * 24 * 60 * 60 * 1000)),
                    count: 0
                })
            }
        }

        weeks[0].count += 1
        user.lastActivity = today

        let count = 0
        weeks.forEach(week => {
            count += week.count
            week.date = week.date.getFullYear() + '-' + (week.date.getMonth()+1) + '-' + week.date.getDate()
        })

        user = await this.updateUserWeeks(user,weeks)

        const activityRole = state.guild.roles.cache.find(role => role.name === 'Regular')
        if (!await state.member.roles.cache.find(r => r.name === 'Regular')) {
            if (count > 18) {
                await state.member.roles.add(activityRole);
                const dm = await state.member.createDM()
                await dm.send('Congratulations with how active you have been in ' + state.guild.name
                    +' you have been given the role Regular.  You can now invite new members to the Server and have been given access to the OG channels');
            }
        }else {
            if(count < 9){
                await state.member.roles.remove(activityRole);
                const dm = await state.member.createDM()
                await dm.send('Due to your low activity in '+ state.guild.name + " the role Regular has been removed.")
            }
        }

        await db.updateUser(user)
    }


    async updateUserWeeks(user, weeks){
        user.week1 = weeks[0].date
        user.first = weeks[0].count
        user.week2 = weeks[1].date
        user.second = weeks[1].count
        user.week3 = weeks[2].date
        user.third = weeks[2].count
        user.week4 = weeks[3].date
        user.forth = weeks[3].count
        user.week5 = weeks[4].date
        user.fifth = weeks[4].count
        user.week6 = weeks[5].date
        user.sixth = weeks[5].count
        return user
    }
}

module.exports = activityRole