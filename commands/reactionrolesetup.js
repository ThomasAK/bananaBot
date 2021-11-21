module.exports = {
    name: 'reactionrolesetup',
    description: 'set role based on reaction',
    async execute(message, args, Discord) {
        const emojis = require('../resources/emojis').emojis
        let embed = new Discord.MessageEmbed()
            .setColor('#e42643')
            .setTitle('Select Roles')
            .setDescription('These roles will give you access to the different channels we have and will make it so you get pinged when people are lfg for that game.\n\n'
                + `|${emojis.haloEmoji} for Halo Role|    `
                + `|${emojis.wzEmoji} for WZ Role|    `
                + `|${emojis.codEmoji} for COD Role|    `
                + `|${emojis.bfEmoji} for BF Role|\n`
                + `|${emojis.gtaEmoji} for GTA Role|     `
                + `|${emojis.streamersEmoji} for Streamer Role| \n    `
                + `|${emojis.eftEmoji} for EFT Role|`)
        let messageEmbed = await message.channel.send(embed);
        await messageEmbed.react(emojis.haloEmoji);
        await messageEmbed.react(emojis.wzEmoji);
        await messageEmbed.react(emojis.codEmoji);
        await messageEmbed.react(emojis.bfEmoji);
        await messageEmbed.react(emojis.gtaEmoji);
        await messageEmbed.react(emojis.streamersEmoji);
        await messageEmbed.react(emojis.eftEmoji);
    }
}