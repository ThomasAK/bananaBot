
class RemoveChannel {
    execute(oldState){
        if (!oldState.channel.members) oldState.channel.delete('Channel Empty')
    }
}

module.exports =  new RemoveChannel()