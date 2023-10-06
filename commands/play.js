const ytdl = require('ytdl-core')
const ytSearch = require('yt-search')
const {joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus} = require('@discordjs/voice')
const player = createAudioPlayer()

const queue = new Map()
// queue(message.guild.id, queue_constructor object {voice channel, text channel, connection, song[]})
module.exports = {
    name: 'play',
    aliases: ['skip', 'stop'],
    coolDown: 0,
    async execute(message, args, cmd){

        const voice_channel = message.member.voice.channel;
        if (!voice_channel) return message.channel.send('You need to be in a channel to use the music bot')
        const permissions = voice_channel.permissionsFor(message.client.user)
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) return message.channel.send('You dont have to correct permissions' )

        const server_queue = queue.get(message.guild.id);

        if (cmd === 'play') await setUpSong(message, args, server_queue, voice_channel)
        else if (cmd === 'skip') await skipSong(message, server_queue)
        else if (cmd === 'leave') await stop_song(message, server_queue)
        else if (cmd === 'pause') await pause_song(message)
        else if (cmd === 'resume') await resume_song(message)
        else if (cmd === 'queue') await song_queue(message, server_queue)
        else if (cmd === 'clear') await clear_queue(message.guild)
    }
}

//Create server_queue if not set up and add bot to channel and play song.
//If server_queue is set up then add song to queue.
const setUpSong = async (message, args, server_queue, voice_channel) => {
    if (!args.length) return message.channel.send('You need to add the song you want')
    const song = await getSongURL(message, args);
    if (!server_queue) await setUpServerQueue(message, voice_channel, song)
    else await addSongToQueue(message,server_queue,song)
}

//Clear queue and remove bot from channel

const clear_queue = async (guild) => {
    queue.delete(guild.id)
}

//Create song resource then play song.
const video_player = async (message, song) =>{
    const song_queue = await queue.get(message.guild.id)

    console.log(song.title)

    if (!song) {
        console.log('connection destroyed.')
        await clear_queue(message.guild)
        await song_queue.connection.destroy();
        return
    }

    const stream = await ytdl(song.url, {filter: 'audioonly'});
    const resource = await createAudioResource(stream)
    await player.play(resource)
    await message.channel.send(`Now Playing ${song.title}`)
}

//If args[0] is  url then get info through url and pass it back.
//If args[0] is not url locate song in YouTube then collect URL and then pass song info back
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

    await queue.set(message.guild.id, queue_constructor);
    const server_queue = queue.get(message.guild.id)
    server_queue.songs.push(song)
    try {
        server_queue.connection = await joinVoiceChannel({
            channelId: voice_channel.id,
            guildId: voice_channel.guild.id,
            adapterCreator: voice_channel.guild.voiceAdapterCreator,
        })
        await server_queue.connection.subscribe(player)
        await video_player(message, await server_queue.songs.shift())
        await player.on('error', async error => {
            console.error(error);
            await video_player(message, await server_queue.songs.shift())
        });
        player.on(AudioPlayerStatus.Idle, async () => {
            console.log(server_queue.songs)
            await video_player(message, server_queue.songs.shift());
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
    await video_player(message, server_queue.songs.shift())
}

const stop_song = async (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel')
    if (!server_queue.connection) return message.channel.send('Bot not connected. ')
    await clear_queue(message.guild)
    await server_queue.connection.destroy();
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