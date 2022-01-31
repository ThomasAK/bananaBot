module.exports = {
    name: 'lf',
    description: 'This will create a LFG message that includes a join button for the channel the user is in.',
    execute(message){
        if (!message.member.voice.channel) return message.channel.send("You must be in a voice channel for this to work.");
        message.edit(`${message.content.slice(4)} \n ${message.member.voice.channel.createInvite()}`)
    }
}