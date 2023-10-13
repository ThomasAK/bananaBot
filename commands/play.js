const ytdl = require('ytdl-core')
const ytSearch = require('yt-search')
const {joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus} = require('@discordjs/voice')
const player = createAudioPlayer()
const cookie = 'LOGIN_INFO=AFmmF2swRAIgXI2owcG_TQ2_F-OPwNFLVoh3NAZAYs1D2ku9MQt0350CIBq-zclJS1V49zBBbl3JIJLAYM1M1vizhhmb6BXQe9xJ:QUQ3MjNmemxtRGZGSkYyVklqa09CTVBUYVpaTDF2UFItbXMtN2p1OE05SWJtNktQYUpxU014allqbGpoOUk1RXVZcWhMWjRma3RwLUg0alRKLVBkWHRFVFh5OVRuaWM0MXdrQmJ4a0RCdW85S3J1bFdMeHowMDBKbTJxTEJ3N2Y1V012VEtTelF1OHlNa1FGanB4SjRmQmV2X09heXlveFl3; VISITOR_INFO1_LIVE=oBrrx3iCyQ8; PREF=tz=America.Denver&f6=40000000&f5=20000&f7=100; VISITOR_PRIVACY_METADATA=CgJVUxICGgA%3D; YSC=v5QvChCd_OI; SID=bQhgi2rJkbnHyHkfN2AO3W0AOZr4f4-JUUEBV6hR7goIWFfaR0xlI-nXVU3ta9lBMJZhaw.; __Secure-1PSID=bQhgi2rJkbnHyHkfN2AO3W0AOZr4f4-JUUEBV6hR7goIWFfayTcxyiWrkd3GKCV-ruo1aQ.; __Secure-3PSID=bQhgi2rJkbnHyHkfN2AO3W0AOZr4f4-JUUEBV6hR7goIWFfasY0-lW8yRIz8ZduIJHZmyQ.; HSID=AwBGOY5Or1mV_jR7X; SSID=AmjXi35iYAIU2qa3u; APISID=bIfyae2zo6_uzzBD/AhjYOE55WwYnK62mR; SAPISID=U2lBjqp-_bpSoKqW/AnMWeqgcPsI2Zuanq; __Secure-1PAPISID=U2lBjqp-_bpSoKqW/AnMWeqgcPsI2Zuanq; __Secure-3PAPISID=U2lBjqp-_bpSoKqW/AnMWeqgcPsI2Zuanq; __Secure-1PSIDTS=sidts-CjIB3e41hVAK-qxninHm29r_w09ZA_jZTS5m9bCrivBJxUb5Qj_4xXS9rBCI1eT3PBTO1BAA; __Secure-3PSIDTS=sidts-CjIB3e41hVAK-qxninHm29r_w09ZA_jZTS5m9bCrivBJxUb5Qj_4xXS9rBCI1eT3PBTO1BAA; SIDCC=ACA-OxMx1-jWXhuaoG74MLny6GP9KiN4c7ZqtWreeqC4VyMXWJklcWYFuKTJvqJw58OHo0ml9zs; __Secure-1PSIDCC=ACA-OxNfV3znNtoj3acr1XHwVP_KcdNteQxVXwwqHefFEtKw4waFPrWP-Hgsl3fDkDSQ9iKnG5M; __Secure-3PSIDCC=ACA-OxPJ1pSW9IyVzicB7cnX9Q5fUU6kemZ5aEgPZ-NH-OuXgwe3Dpa-Vq407yBRLJbDB17moxE; ST-1b=disableCache=true&itct=CCAQsV4iEwif6ty9xOqBAxXsSUwIHXeECJ8%3D&csn=MC40MjI5MDExODUzMDMzOTE3&endpoint=%7B%22clickTrackingParams%22%3A%22CCAQsV4iEwif6ty9xOqBAxXsSUwIHXeECJ8%3D%22%2C%22commandMetadata%22%3A%7B%22webCommandMetadata%22%3A%7B%22url%22%3A%22%2F%22%2C%22webPageType%22%3A%22WEB_PAGE_TYPE_BROWSE%22%2C%22rootVe%22%3A3854%2C%22apiUrl%22%3A%22%2Fyoutubei%2Fv1%2Fbrowse%22%7D%7D%2C%22browseEndpoint%22%3A%7B%22browseId%22%3A%22FEwhat_to_watch%22%7D%7D'

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
    const server_queue = queue.get(message.guild.id)
    try {
        const stream = await ytdl(await song.url, {filter: 'audioonly',
        requestOptions: {
            headers: {
                Cookie: cookie
            }
        }});
        const resource = await createAudioResource(stream)
        await player.play(resource)
        await message.channel.send(`Now Playing ${song.title}`)
    }catch (err) {
        console.log(`${err} video_player failure?`)
        message.channel.send('Song failed to play.')
        if (server_queue.songs.length === 0) {
            await server_queue.connection.destroy();
            await clear_queue(message.guild)
            return
        }
        await video_player(message, await server_queue.songs.shift())
    }
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
        await sleep(1000)
        await player.on('error', async error => {
            console.error(`${error} audio player Error.......`);
            message.channel.send(`Song Failed to play try different song.`)
            if (server_queue.songs.length === 0) {
                await server_queue.connection.destroy();
                await clear_queue(message.guild)
                return
            }
            await video_player(message, await server_queue.songs.shift())
        });
        await player.on(AudioPlayerStatus.Idle, async () => {
            console.log(server_queue.songs)
            if (server_queue.songs.length === 0) {
                await server_queue.connection.destroy();
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
        await server_queue.connection.destroy();
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


