module.exports = {
    name: 'lf',
    description: 'This will create a LFG message that includes a join button for the channel the user is in.',
    async execute(message){
        if (!message.member.voice.channel) return message.channel.send("You must be in a voice channel for this to work.");
        message.channel.send(`@${message.member.nickname} ${message.content.slice(4)} \n ${await message.member.voice.channel.createInvite()}`).then()
            .catch(console.error);
        message.delete()
    }
}