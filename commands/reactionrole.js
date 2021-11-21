
const emojis = require('../resources/emojis').emojis
const data = require('data.json')

function getRolesFromReaction(reaction){
    return {
        haloRole: reaction.message.guild.roles.cache.find(role => role.name === 'Halo'),
        wzRole: reaction.message.guild.roles.cache.find(role => role.name === 'WZ'),
        codRole: reaction.message.guild.roles.cache.find(role => role.name === 'COD'),
        bfRole: reaction.message.guild.roles.cache.find(role => role.name === 'BF'),
        gtaRole: reaction.message.guild.roles.cache.find(role => role.name === 'GTA'),
        streamerRole: reaction.message.guild.roles.cache.find(role => role.name === 'Streamers'),
        eftRole: reaction.message.guild.roles.cache.find(role => role.name === 'EFT')
    }
}


module.exports = {
    name: 'reactionrole',
    reactionRoleAdd: async (reaction, user) => {
        const roles = getRolesFromReaction(reaction)
        if (reaction.message.channel.id == data.channelID) {

            switch (reaction.emoji.name){
                case emojis.wzEmoji:
                    await reaction.message.guild.members.cache.get(user.id).roles.add(roles.wzRole);
                    break;
                case emojis.codEmoji:
                    await reaction.message.guild.members.cache.get(user.id).roles.add(roles.codRole);
                    break;
                case emojis.bfEmoji:
                    await reaction.message.guild.members.cache.get(user.id).roles.add(roles.bfRole);
                    break;
                case emojis.gtaEmoji:
                    await reaction.message.guild.members.cache.get(user.id).roles.add(roles.gtaRole);
                    break;
                case emojis.streamersEmoji:
                    await reaction.message.guild.members.cache.get(user.id).roles.add(roles.streamerRole);
                    break;
                case emojis.eftEmoji:
                    await reaction.message.guild.members.cache.get(user.id).roles.add(roles.eftRole);
                    break;
                case emojis.haloEmoji:
                    await reaction.message.guild.members.cache.get(user.id).roles.add(roles.haloRole);
                    break;
            }
        }
    },
    reactionRoleRemove: async (reaction, user) =>{
        const roles = getRolesFromReaction(reaction)
        if (reaction.message.channel.id == data.channelID) {

            switch (reaction.emoji.name){
                case emojis.wzEmoji:
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(roles.wzRole);
                    break;
                case emojis.codEmoji:
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(roles.codRole);
                    break;
                case emojis.bfEmoji:
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(roles.bfRole);
                    break;
                case emojis.gtaEmoji:
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(roles.gtaRole);
                    break;
                case emojis.streamersEmoji:
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(roles.streamerRole);
                    break;
                case emojis.eftEmoji:
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(roles.eftRole);
                    break;
                case emojis.haloEmoji:
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(roles.haloRole);
                    break;
            }
        }
    }
}