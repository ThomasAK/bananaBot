
module.exports = {
    name: 'timeout',
    async execute(message, userID){
        const user = message.guild.members.cache.get(userID)
        const dm = await user.createDM()
        await dm.send('First off let me just say we get it playing games can be stressful and hard! So we just want to help you and let you know its all gonna be ok!  Now is your time to relax and chill for a minute. After the minute has passed you will be reactivated and put back in your voice channel you were in. ')
    }
}