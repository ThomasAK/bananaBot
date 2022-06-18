
class RemoveChannel {
    execute(oldState){
        console.log(oldState.channel.size)
        if (oldState.channel.members.size < 1) oldState.channel.delete('Channel Empty')
    }
}

module.exports =  new RemoveChannel()