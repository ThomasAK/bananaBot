const ytdl = require('ytdl-core')
const ytSearch = require('yt-search')
const {joinVoiceChannel} = require('@discordjs/voice')

const queue = new Map()
// queue(message.guild.id, queue_constuctor object {voice channel, text channel, connection, song[]})
module.exports = {
    name: 'play',
    aliases: ['skip', 'stop'],
    cooldown: 0,
    async execute(message, args, cmd){

        const voice_channel = message.member.voice.channel;
        if (!voice_channel) return message.channel.send('You need to be in a channel to use the music bot')
        const permissions = voice_channel.permissionsFor(message.client.user)
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) return message.channel.send('You dont have to correct permissions' )

        const server_queue = queue.get(message.guild.id);

        if (cmd === 'play'){
            if(!args.length) return message.channel.send('You need to add the song you want')
            let song = {};

            if (ytdl.validateURL(args[0])){
                const song_info = await ytdl.getInfo(args[0]);
                song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url}
            } else {
                //If the video is not a URL then use keywords to find that video.
                const video_finder = async (query) => {
                    const videoResults = await ytSearch(query);
                    return (videoResults.videos.length > 1) ? videoResults.videos[0] : null
                }

                const video = await video_finder(args.join(' '));
                if (video){
                    song = { title: video.title, url: video.url }
                }else {
                    message.channel.send('Unable to find video');
                }
            }

            if (!server_queue){

                const queue_constructor = {
                    voice_channel: voice_channel,
                    text_channel: message.channel,
                    connection: null,
                    songs: []
                }

                queue.set(message.guild.id, queue_constructor);
                queue_constructor.songs.push(song);

                try {
                    const connection = await joinVoiceChannel({
                        channelId: voice_channel.id,
                        guildId: voice_channel.guild.id,
                        adapterCreator: voice_channel.guild.voiceAdapterCreator,
                    })
                    queue_constructor.connection = connection;
                    await video_player(message.guild, queue_constructor.songs[0])
                } catch (err){
                    queue.delete(message.guild.id)
                    message.channel.send('There was an error connecting')
                    throw err;
                }
            } else {
                server_queue.songs.push(song)
                return message.channel.send(`${song.title} added to queue!`)
            }
        }

        else if (cmd === 'skip') skipSong(message, server_queue)
        else if (cmd === 'stop') stop_song(message, server_queue)
    }
}

const video_player = async (guild, song) =>{
    const song_queue = queue.get(guild.id)

    if (!song) {
        await song_queue.voice_channel.leave();
        queue.delete(guild.id)
        return;
    }

    const stream = ytdl(song.url, {filter: 'audioonly'});
    song_queue.connection.play(stream, {seek: 0, volume: 0.5})
        .on('finish', () => {
            song_queue.songs.shift();
            video_player(guild, song_queue.songs[0]);
        })
    await song_queue.text_channel.send(`Now Playing ${song.title}`)
}

const skipSong = (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel')
    if (!server_queue) return message.channel.send('No songs in queue')
    server_queue.connection.destroy()
}

const stop_song = (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel')
    server_queue.songs = [];
    server_queue.connection.destroy();
}