
class RemoveChannel {
    execute(oldState){
        console.log('gate 2')
        if (!oldState.channel.members) oldState.channel.delete('Channel Empty')
        console.log(oldState.channel.members)
    }
}

module.exports =  new RemoveChannel()