module.exports = {
    name: 'roll',
    description: 'Dice roll!',
    execute(message){
        const messageDetails = message.content.split(/ +/)
        console.log(messageDetails[1])
        const dieNumber = Math.floor(Math.random() * messageDetails[1]);
        console.log(dieNumber)
        message.channel.send(dieNumber)
    }
}