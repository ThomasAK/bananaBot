const play = require("play-dl") 

const {joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior, VoiceConnectionStatus} = require('@discordjs/voice')
const player = createAudioPlayer()
const ytdl = require("youtube-dl-exec")
const fs = require('fs');
const os = require('os');
const path = require('path');

const { raw } = require("mysql2")
const TEMP_DIR = path.join(os.tmpdir(), 'discord-music-bot');

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

async function downloadAudio(videoUrl) {
  console.log(`Downloading audio from: ${videoUrl}`);
  
  // Generate a unique filename based on timestamp
  const timestamp = Date.now();
  const outputFile = path.join(TEMP_DIR, `audio-${timestamp}.mp3`);
  
  try {
    // Use youtube-dl-exec to download audio only
    await ytdl(videoUrl, {
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: 0, // Best quality
      output: outputFile,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0'],
    });
    
    console.log(`Downloaded audio to: ${outputFile}`);
    return outputFile;
  } catch (error) {
    console.error('Error downloading audio:', error);
    throw error;
  }
}

//Create song resource then play song.
const video_player = async (message, song) =>{
    const server_queue = queue.get(message.guild.id)
    if (!server_queue) return
    try {
        
        const audioFile = await downloadAudio(song.url);
    
        // Create a read stream from the downloaded file
        const audioStream = fs.createReadStream(audioFile);
        
        // Create an audio resource from the file stream
        const resource = createAudioResource(audioStream, {
        inlineVolume: true
        });

        player.on('stateChange', (oldState, newState) => {
            if (newState.status === 'idle') {
                console.log(`Cleaning up temp file: ${audioFile}`);
                fs.unlink(audioFile, (err) => {
                if (err) console.error('Error removing temp file:', err);
                });
            }
        })
        
        await player.play(resource)
        await message.channel.send(`Now Playing ${song.title}`)
        
    }catch (err) {
        console.log(`${err} video_player failure?`)
        console.trace(err);
        message.channel.send('Song failed to play.')
        player.stop()
        if (server_queue.songs.length === 0) {
            server_queue.connection.destroy();
            await clear_queue(message.guild)
            return
        }
        await video_player(message, await server_queue.songs.shift())
    }
}

//If args[0] is  url then get info through url and pass it back.
//If args[0] is not url locate song in YouTube then collect URL and then pass song info back
const getSongURL = async (message, args)=>{
    if (play.validate(args[0]) && await play.validate(args[0]) != "search") {
        console.log(await play.validate(args[0]))
        const song_info = await play.video_info(args[0]);
        return  {title: song_info.video_details.title, url: song_info.video_details.url}
    } else {
        //If the video is not a URL then use keywords to find that video.
        
        const video = await play.search(args.toString(), {
            limit: 1
        })
    
        if (video) {
            return  {title: video[0].title, url: video[0].url}
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
        
        
        await video_player(message, await server_queue.songs.shift())
        await server_queue.connection.subscribe(player)
        await sleep(1000)
        await player.on('error', async error => {
            console.error(`${error} audio player Error....... \n ${server_queue.songs}`);
            let channel = message.guild.channels.cache.find(channel => channel.name === 'bot-commands');
            let failMessage = `Song Failed to play try different song..`
            let lastMessage = channel.lastMessage.content
            console.log(lastMessage)
            if (channel && lastMessage !== failMessage) {
                channel.send(failMessage)
            }
            player.stop()
            if (server_queue.songs.length === 0) {
                server_queue.connection.destroy();
                await clear_queue(message.guild)
            }else {
                message.channel.send('Playing next song.')
                await video_player(message, await server_queue.songs.shift())
            }

        });
        
        await player.on(AudioPlayerStatus.Idle, async () => {
            console.log(server_queue.songs)
            if (server_queue.songs.length === 0) {
                player.stop();
                server_queue.connection.destroy();
                await clear_queue(message.guild)
                return
            }
            await video_player(message, await server_queue.songs.shift());
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
    if (server_queue.songs.length === 0){
        server_queue.connection.destroy();
        await clear_queue(message.guild)
        return message.channel.send('No songs in queue')
    }
    player.stop()
    await video_player(message, server_queue.songs.shift())
}

const stop_song = async (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel')
    if (!server_queue.connection) return message.channel.send('Bot not connected. ')
    await server_queue.connection.destroy();
    await clear_queue(message.guild)
}

const pause_song = ()=>{
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


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


