
class RemoveChannel {
    execute(oldState){
        if (oldState.channel.name === 'Hang Out' || oldState.channel.name ===  'Admin Voice' || oldState.channel.name ===  'Waiting For Squad' || oldState.channel.name ===  'AFK' || oldState.channel.guild.name === 'snowbuilt') return
        if (oldState.channel.members.size < 1) oldState.channel.delete('Channel Empty')
    }
}

module.exports =  new RemoveChannel()