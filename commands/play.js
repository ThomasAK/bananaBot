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
    const server_queue = queue.get(message.guild.id)
    if (!server_queue) return
    try {
        const stream = await ytdl(await song.url, {filter: 'audioonly',
        requestOptions: {
            headers: {
                Cookie: 'LOGIN_INFO=AFmmF2swRAIgXI2owcG_TQ2_F-OPwNFLVoh3NAZAYs1D2ku9MQt0350CIBq-zclJS1V49zBBbl3JIJLAYM1M1vizhhmb6BXQe9xJ:QUQ3MjNmemxtRGZGSkYyVklqa09CTVBUYVpaTDF2UFItbXMtN2p1OE05SWJtNktQYUpxU014allqbGpoOUk1RXVZcWhMWjRma3RwLUg0alRKLVBkWHRFVFh5OVRuaWM0MXdrQmJ4a0RCdW85S3J1bFdMeHowMDBKbTJxTEJ3N2Y1V012VEtTelF1OHlNa1FGanB4SjRmQmV2X09heXlveFl3; VISITOR_PRIVACY_METADATA=CgJVUxICGgA%3D; HSID=AApdn_4cLPcwyva3g; SSID=AygT3JeWepxO-HZ4b; APISID=Q4rFMhzNUZ-VuxK7/ASJ7LjN8wtplNeEZ-; SAPISID=T7d-rorgCnARILcT/ARcxCFdvhbFCA92qH; __Secure-1PAPISID=T7d-rorgCnARILcT/ARcxCFdvhbFCA92qH; __Secure-3PAPISID=T7d-rorgCnARILcT/ARcxCFdvhbFCA92qH; VISITOR_INFO1_LIVE=oBrrx3iCyQ8; PREF=f6=40000000&f7=4100&tz=America.Denver&f5=20000; SID=dAhgiyhbMahdTrwEl7TyP5Zh9tg6vXpfmpncyWN4N0d9KTEuzfMgLjR9l06Gir0zEvVYkw.; __Secure-1PSID=dAhgiyhbMahdTrwEl7TyP5Zh9tg6vXpfmpncyWN4N0d9KTEuYq61e8WtP6adZe2LzGCN9A.; __Secure-3PSID=dAhgiyhbMahdTrwEl7TyP5Zh9tg6vXpfmpncyWN4N0d9KTEu7e3iz9H5o9Qzr756PcKPng.; YSC=K_gzaj_5BY4; __Secure-1PSIDTS=sidts-CjIBNiGH7kEmS2VA-utTO2bqEiarW4Cxj2nTui2RVQ_9M7TPO0G8CWKCRQ6EVhDLuYfcwxAA; __Secure-3PSIDTS=sidts-CjIBNiGH7kEmS2VA-utTO2bqEiarW4Cxj2nTui2RVQ_9M7TPO0G8CWKCRQ6EVhDLuYfcwxAA; SIDCC=ACA-OxNH5go0br2vXGrSw5RgKhR1NTDUXhnRLAW0wWS7Fp6YoF_XbRAfTpWrkOO7U6tboOwQL7E; __Secure-1PSIDCC=ACA-OxNLETCpFXCmdZayQ-VTYx_4A9vVVbKiqwFpvdjSlAj40tE1uVEpngm7V9cXYuNapvFgv2U; __Secure-3PSIDCC=ACA-OxMkPXNRoOG2wYS7_QbPFA7Op2EhBOqEnQ60dffYZtGpDFC_jeTWTQLQ_eVjYpWC6x2skOs; ST-10eigm9=itct=CH0QyCAYASITCKuc9qznvYIDFeBmTAgdTX4NsDIDQkZhSPHmtozOiJ2xXJoBBQgMEPgd&csn=MC41Nzk2NTE0MzYxOTY2OQ..&endpoint=%7B%22clickTrackingParams%22%3A%22CH0QyCAYASITCKuc9qznvYIDFeBmTAgdTX4NsDIDQkZhSPHmtozOiJ2xXJoBBQgMEPgd%22%2C%22commandMetadata%22%3A%7B%22webCommandMetadata%22%3A%7B%22url%22%3A%22%2Fwatch%3Fv%3DRm7OLlwtNL0%26list%3DOLAK5uy_lhflSRynwMpe8kPIzMrEWH27EqXg_FBEc%26index%3D2%26pp%3D8AUB%22%2C%22webPageType%22%3A%22WEB_PAGE_TYPE_WATCH%22%2C%22rootVe%22%3A3832%7D%7D%2C%22watchEndpoint%22%3A%7B%22videoId%22%3A%22Rm7OLlwtNL0%22%2C%22playlistId%22%3A%22OLAK5uy_lhflSRynwMpe8kPIzMrEWH27EqXg_FBEc%22%2C%22index%22%3A1%2C%22params%22%3A%22OAE%253D%22%2C%22playerParams%22%3A%228AUB%22%2C%22loggingContext%22%3A%7B%22vssLoggingContext%22%3A%7B%22serializedContextData%22%3A%22GilPTEFLNXV5X2xoZmxTUnlud01wZThrUEl6TXJFV0gyN0VxWGdfRkJFYw%253D%253D%22%7D%7D%2C%22watchEndpointSupportedOnesieConfig%22%3A%7B%22html5PlaybackOnesieConfig%22%3A%7B%22commonConfig%22%3A%7B%22url%22%3A%22https%3A%2F%2Frr1---sn-qpgxjujvhh-naje.googlevideo.com%2Finitplayback%3Fsource%3Dyoutube%26oeis%3D1%26c%3DWEB%26oad%3D3200%26ovd%3D3200%26oaad%3D11000%26oavd%3D11000%26ocs%3D700%26oewis%3D1%26oputc%3D1%26ofpcc%3D1%26beids%3D24350018%26siu%3D1%26msp%3D1%26odepv%3D1%26id%3D466ece2e5c2d34bd%26ip%3D206.251.42.135%26initcwndbps%3D943750%26mt%3D1699769336%26oweuc%3D%26pxtags%3DCg4KAnR4Egg1MTAxODg2NA%26rxtags%3DCg4KAnR4Egg1MTAxODg2NA%252CCg4KAnR4Egg1MTAxODg2NQ%252CCg4KAnR4Egg1MTAxODg2Ng%252CCg4KAnR4Egg1MTAxODg2Nw%252CCg4KAnR4Egg1MTAxODg2OA%252CCg4KAnR4Egg1MTAxODg2OQ%252CCg4KAnR4Egg1MTAxODg3MA%22%7D%7D%7D%7D%7D'
            }
        }});
        const resource = await createAudioResource(stream)
        await player.play(resource)
        await message.channel.send(`Now Playing ${song.title}`)
    }catch (err) {
        console.log(`${err} video_player failure?`)
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


