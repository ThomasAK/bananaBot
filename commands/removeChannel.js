
class RemoveChannel {
    execute(oldState){
        if (oldState.channel.name === 'Hang Out' || oldState.channel.name ===  'Admin Voice') return
        if (oldState.channel.members.size < 1) oldState.channel.delete('Channel Empty')
    }
}

module.exports =  new RemoveChannel()