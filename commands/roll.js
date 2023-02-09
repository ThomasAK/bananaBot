module.exports = {
    name: 'roll',
    description: 'Dice roll!',
    execute(message){
        const messageDetails = message.content.split(/ +/)
        const dieNumber = Math.floor(Math.random() * messageDetails[1]);
        message.channel.send(`Roll: ${dieNumber}`)
    }
}