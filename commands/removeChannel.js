
class RemoveChannel {
    execute(oldState){
        if (!oldState.channel.members) oldState.channel.delete('Channel Empty')
    }
}

export default new RemoveChannel()