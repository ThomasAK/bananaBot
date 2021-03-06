const ytdl = require('ytdl-core')
const ytSearch = require('yt-search')
const {joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, AudioPlayer} = require('@discordjs/voice')
const player = createAudioPlayer()

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

        if (cmd === 'play') await setUpSong(message, args, server_queue, voice_channel)
        else if (cmd === 'skip') await skipSong(message, server_queue)
        else if (cmd === 'stop') await stop_song(message, server_queue)
        else if (cmd === 'pause') await pause_song(message)
        else if (cmd === 'resume') await resume_song(message)
        else if (cmd === 'queue') await song_queue(message, server_queue)
    }
}

//Create server_queue if not set up and add bot to channel and play song.
//If server_queue is set up then add song to queue.
const setUpSong = async (message, args, server_queue, voice_channel) => {
    if (!args.length) return message.channel.send('You need to add the song you want')
    let song = await getSongURL(message, args);
    if (!server_queue) await setUpServerQueue(message, voice_channel, song)
    else await addSongToQueue(message,server_queue,song)
}

//Create song resource then play song.
const video_player = async (guild, song) =>{
    const song_queue = queue.get(guild.id)

    if (!song) {
        await song_queue.connection.destroy();
        queue.delete(guild.id)
        return;
    }

    const stream = ytdl(song.url, {filter: 'audioonly'});
    song_queue.connection.subscribe(player)
    const resource = createAudioResource(stream, { inlineVolume: true})
    player.play(resource)
    await song_queue.text_channel.send(`Now Playing ${song.title}`)
}

//If args[0] is a url then get info through url and pass it back.
//If args[0] is not a url locate song in youtube then collect URL and then pass song info back
const getSongURL = async (message, args)=>{
    if (ytdl.validateURL(args[0])) {
        const song_info = await ytdl.getInfo(args[0]);
        return  {title: song_info.videoDetails.title, url: song_info.videoDetails.video_url}
    } else {
        //If the video is not a URL then use keywords to find that video.
        const video_finder = async (query) => {
            const videoResults = await ytSearch(query);
            return (videoResults.videos.length > 1) ? videoResults.videos[0] : null
        }

        const video = await video_finder(args.join(' '));
        if (video) {
            return  {title: video.title, url: video.url}
        } else {
            message.channel.send('Unable to find video');
        }
    }
}


//Create server queue and set up connection and start playing song.
const setUpServerQueue = async (message, voice_channel, song)=>{
    const queue_constructor = {
        voice_channel: voice_channel,
        text_channel: message.channel,
        connection: null,
        songs: []
    }

    queue.set(message.guild.id, queue_constructor);
    queue_constructor.songs.push(song);

    try {
        queue_constructor.connection = await joinVoiceChannel({
            channelId: voice_channel.id,
            guildId: voice_channel.guild.id,
            adapterCreator: voice_channel.guild.voiceAdapterCreator,
        })
        await video_player(message.guild, queue_constructor.songs.shift())
        player.on(AudioPlayerStatus.Idle, () => {
            video_player(message.guild, queue_constructor.songs.shift());
        });
    } catch (err){
        queue.delete(message.guild.id)
        message.channel.send('There was an error connecting')
        throw err;
    }
}

const addSongToQueue = async (message, server_queue, song)=>{
    server_queue.songs.push(song)
    return message.channel.send(`${song.title} added to queue!`)
}

const skipSong = async (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel')
    if (!server_queue) return message.channel.send('No songs in queue')
    player.stop()
    await video_player(message.guild, server_queue.songs.shift())
}

const stop_song = async (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel')
    await server_queue.connection.destroy();
    server_queue = null
}

const pause_song = ()=>{
    console.log(AudioPlayerStatus.Playing)
    player.pause()
}

const resume_song = ()=>{
    player.unpause()
}

const song_queue = async (message, server_queue)=>{
    if (!server_queue.songs) return message.channel.send('No songs in queue')
    let string = server_queue.songs.map(song => {if (song.title) return `${song.title} \n`})
    message.channel.send(`Songs: ${string.join('')}`)
}