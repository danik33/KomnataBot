const DS = require('discord.js');
const { Client, Intents } = require('discord.js');
const fs = require('fs');
require("dotenv").config();
const { joinVoiceChannel } = require('@discordjs/voice');


var gmsg;


const selfID = "938855475909386270";

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});




// process.stdin.resume();

// async function exitHandler(options, exitCode) {
//     console.log("Exiting..");
//     client.destroy();
//     await sleep(2000);
//     console.log("destroyed");
//     if (options.cleanup) console.log('clean');
//     if (exitCode || exitCode === 0) console.log(exitCode);
//     if (options.exit) process.exit();
// }

// //do something when app is closing
// process.on('exit', exitHandler.bind(null,{cleanup:true}));

// //catches ctrl+c event
// process.on('SIGINT', exitHandler.bind(null, {exit:true}));



// // catches "kill pid" (for example: nodemon restart)
// process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
// process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

// //catches uncaught exceptions
// process.on('uncaughtException', exitHandler.bind(null, {exit:true}));



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function writeData()
{
    fs.writeFile("data.json", JSON.stringify(data, null, 2), (err) => {
        if(err)
        {
            console.log("Error at writing data");
        }
       
    })
}

var data;
process.stdout.write('\033c');
console.log("-------------------------------");
console.log("Starting..");

fs.readFile("data.json", (err, inp) => {
    if(err)
    {
        console.log("No file, creating");
        fs.writeFile("data.json", "{}", (err) => {
            if(err)
            {
                console.log("Error at creating file ");
            }
            else
            {
                console.log("Sucsessfully created file !");
                data = {};
            }
        })
    }
    else
    {
        data = JSON.parse(inp);
        console.log("Loaded data.");
    }

});


function isMention(str)
{
    if(str.startsWith("<@") && str.endsWith(">") && str.length > 20 && str.length < 25)
        return true;
    return false;
}

function idFromMention(st)
{
    return st.slice(3, -1)
    // console.log("Here is string:", a);
}
function addAlias(msg, words)
{
    let guildId = msg.guildId;
    let userID;
    let self = false;
    if(words.length == 1)
    {
        if(isMention(words[0]))
        {
            msg.channel.send("Incorrect use of addAlias, use /pomogite for help");
            return;
        }
        else
        {
            userID = msg.author.id;
            self = true;
        }
        
    }
    else
    {

        if(isMention(words[0]))
        {
            userID = idFromMention(words[0])
        }
        else
        {
            return;

        }
    }

    if(data["g" + guildId] == null)
        data["g" + guildId] = {};
    let gld = data["g" + guildId];

    if(gld == null)
    {
        gld = {
            
        }
    }
    if(gld["u" + userID] == null)
    {
        gld["u" + userID] = {
            aliases : []
        }
    }

    let d = (self) ? 0 : 1;

    if(gld["u" + userID].aliases.includes(words[d]))
    {
        msg.channel.send("Alias already exists");
    }
    else
    {
        gld["u" + userID].aliases.push(words[d]);

        data["g" + guildId] = gld;

        msg.channel.send("Alias successfuly added.");

        writeData();
    }
 
}

function setPadej(msg, words)
{
    let userID;
    let self = false;
    if(words.length == 1)
    {
        if(isMention(words[0]))
        {
            msg.channel.send("Incorrect use of setPadej, use /pomogite for help");
            return;
        }
        else
        {
            userID = msg.author.id;
            self = true;
        }
        
    }
    else
    {

        if(isMention(words[0]))
        {
            userID = idFromMention(words[0])
            
        }
        else
        {
            return;

        }
    }
    
    if(data["g" + msg.guildId] == null)
        data["g" + msg.guildId] = {};


    if(data["g" + msg.guildId]["u" + userID] == null)
        data["g" + msg.guildId]["u" + userID] = {};



    let d = (self) ? 0 : 1;


    data["g" + msg.guildId]["u" + userID].padej = words[d];


    writeData();

    msg.channel.send("Successfuly set padej");


}


async function setWaiting(msg, words)
{
    console.log("Wait call");
    let id = idFromMention(words[0]);
    let padej = await getPadejById(msg.guildId, id);
    padej = padej.charAt(0).toUpperCase() + padej.slice(1);

    if(padej == null)
    {
        return null;
    }
    let name = "Ожидание " + padej;
    

    msg.guild.channels.create(name, {
        type: 'GUILD_VOICE',
        permissionOverwrites: [{
            id: msg.guild.id,
            allow: ['VIEW_CHANNEL']
        }]
    }).then(v => {
        if(data["g" + msg.guildId] == null)
            data["g" + msg.guildId] = {};
        
        if(data["g" + msg.guildId].active == null)
            data["g" + msg.guildId].active = [];
        
        data["g" + msg.guildId].active.push({"name" : name, "chId" : v.id, "userId" : id, "startTime" : Date.now(), "gldId" : msg.guildId, "initChId" : msg.channel.id});

 
        writeData();
        msg.channel.send("Комната ожидания " + padej);
    });
    
    // console.log(k);
}

async function getPadejById(guildId, userId)
{
    let padej;
    if(data != null)
    {
        if(data["g" + guildId] != null)
        {
            if(data["g" + guildId]["u" + userId] != null)
            {
                if(data["g" + guildId]["u" + userId].padej != null)
                {
                    return data["g" + guildId]["u" + userId].padej;

                }
            }
        } 
    }

    let user = await client.users.fetch(userId);
    padej = user.username;
    if(padej == null)
    {
        msg.channel.send("Error 100");
        return null;
    }
    return padej + "'a";
}


function formatText(str)
{
    return str.toLowerCase().replace(/\s+/g, ' ').trim();
}

async function setMove(msg, words)
{
    if(words.length <= 0)
        return;
    let channels = await msg.guild.channels.fetch();
    let ch = channels.find(e => {
        if(e.type != 'GUILD_VOICE')
            return false;
        return formatText(e.name) == formatText(words[0]);
    });
    if(ch != null)
    {
        if(data["g" + msg.guildId] == null)
            data["g" + msg.guildId] = {};
        data["g" + msg.guildId].moveto = ch.id;
        writeData();
        msg.channel.send("Successfully set default moving channel");
        console.log("Channel found %s:[%s]", ch.name, ch.id);
    }
    else
    {
        let ch2 = channels.find(e => {
            if(e.type == 'GUILD_VOICE')
                return false;
            return formatText(e.name) == formatText(words[0]);
        });
        if(ch2 != null)
            msg.channel.send("[" + ch2.name + "] is not a voice channel");
        else
            msg.channel.send("Channel not found");

    }


}




client.once('ready', async ()=> 
{
    let cc = 0;
    for (var [gkey, gvalue] of Object.entries(data)) 
    {
        if(gvalue.active == null)
            gvalue.active = [];
        for(let i = 0; i < gvalue.active.length; i++)
        {
            try
            {
                await client.channels.fetch(gvalue.active[i].chId);
            }
            catch(er)
            {
                if(er instanceof DS.DiscordAPIError)
                {
                    console.log("Deleting wait data for " + gvalue.active[i].name);
                    gvalue.active.splice(i--, 1);
                    cc++;
                }
            }
            
        }
    }
    if(cc > 0)
    {
        console.log("Deleted %d channels", cc);
        writeData();
    }
    
    
    console.log("Ready");

    
    monitor();
});




client.on('messageCreate', message => {

    
    if(message.author.id == selfID)
        return;

    let msg = formatText(message.content);


    let words = msg.split(" ");

    
    let fWord = words.shift();

    if(fWord == "addalias" || fWord == "addnick" || fWord == "nick" || fWord == "alias")
    {
        addAlias(message, words);
    }

    if(fWord == "padej")
    {
        setPadej(message, words);
    }

    if(msg.includes("sosi"))
    {
        message.channel.send("bibu)");

    }
    
    if(fWord == "ждём" || fWord == "ждать")
    {
        setWaiting(message, words);
    }
    if(fWord == "moveto")
    {
        setMove(message, words);
    }

    if(msg.includes("join"))
    {
        let ss = async () => {
            let a = await client.guilds.fetch('198395676663480320');
            // console.log(a);
            let con = joinVoiceChannel({
                channelId: "939542412768981043",
                guildId: "198395676663480320",
                adapterCreator: a.voiceAdapterCreator
            });
            let time = 5000;
            if(words[0] != null)
            {
                console.log("a ?");
                time = parseFloat(words[0])*1000;
            }
            console.log("Time: " + time);
            await sleep(time);
            con.destroy();

        }
        ss();
        
    }
    

});

client.on('voiceStateUpdate', async (old, newc) => 
{
    let ob;
    let joined;
    if(newc.channelId != null)
    {
        ob = newc;
        joined = true;
    }
    else
    {
        ob = old;
        joined = false;
    }
    
    
    // console.log(ob);
    
    let guild = await client.guilds.fetch(ob.guild.id);
    let ch = await client.channels.fetch(ob.channelId);
    let us = await client.users.fetch(ob.id);
    process.stdout.write(us.tag + " has " + ((joined) ? "joined" : "left") + " the channel " + ch.name + " on " + ob.guild.name + "\n");
    
    if(!joined)
        return;

    if(data["g" + guild.id] == null)
        return;
    if(data["g" + guild.id].active == null)
        return;
    
    for(let i = 0; i < data["g" + ob.guild.id].active.length; i++)
    {
        let wait = data["g" + ob.guild.id].active[i];

        if(wait.userId != us.id)
            continue;
        
        if(wait.chId != ob.channelId)
            continue;

        console.log("End wait on " + ch.name);
        
        let moveto;
        if(data["g" + guild.id].moveto != null)
        {
            moveto = await client.channels.fetch(data["g" + guild.id].moveto);
            console.log("First channel");

        }
        else
        {
            let channels = await guild.channels.fetch();
            moveto = channels.find(e => {
                if(e.type != 'GUILD_VOICE')
                    return false;
                return formatText(e.name).includes(formatText("gen"));
            });
            if(moveto == null)
            {
                console.log("Third channel");
                
                for(let k = 0; k < channels.size; k++)
                {
                    if(channels.at(k).type == "GUILD_VOICE")
                    {
                        moveto = channels.at(k);
                        break;
                    }
                }
                    
            }
            else
            {
                console.log("Second channel");

            }
        }
        
        if(moveto == null)
        {
            console.log("error no voice channels");
            return;
        }


        




     
        for(let j = 0; j < guild.members.cache.size; j++)
        {
            if(guild.members.cache.at(j).voice.channelId == ob.channelId)
                await guild.members.cache.at(j).voice.setChannel(moveto);
        }

        let messageChannel = await client.channels.fetch(wait.initChId);
        let pad = await getPadejById(guild.id, us.id);
        messageChannel.send("Дождались дебила)");
        ch.delete();
        data["g" + ob.guild.id].active.splice(i, 1);
        writeData();

        break;
        
    }


    
    
});


 
var count = 0;
async function monitor(msg)
{
    while(false)
    {
        console.log("--------------------------");

        if(data.active != null && data.active.length > 0)
        {
            for(let i = 0; i < data.active.length; i++)
            {
                // console.log("A ?");
                
                try
                {
                    client.channels.fetch(data.active[i].chId)
                    .then(ch => {
                        if(ch.members.size > 0)
                        {
                            console.log(ch.members.at(0).user.username);

                        }
                        else
                        {
                            console.log("Empty voice");
                        }
                    });
                    // if(a.members.at(0) != null)
                    //     console.log(a.members.at(0).user.username);
                    // else
                    //     console.log("Empty ?");
                    
                }
                catch(e)
                {
                    console.log(e);
                    // console.log("Error finding %s, deleting..", data.active[i].name);
                    // data.active.splice(i, 1);
                    // writeData();
                }


                // for(let j = 0; j < client.guilds.cache.size; j++)
                // {
                //     let gld = client.guilds.cache.at(j);
                //     if(data.active[i].gldId == gld.id)
                //     {
                //         // console.log(gld.channels.cache.at(1).name);
                //         for(let z = 0; z < gld.channels.cache.size; z++)
                //         {
                //             if(client.channels.cache.at(z).id == data.active[i].chId)
                //             {
                //                 console.log("Here it is(%d): %s:[%s]", z, client.channels.cache.at(z).name, client.channels.cache.at(z).id);
                //                 // console.log(client.channels.cache.at(z).members);

                //             }
                //         }
                //     }
                // }
                
            }
            // client.channels.cache.map(e =>{
            //     console.log(e.id)
            // });
            // console.log(data.active);

        }
        count++;
        await sleep(5000);
        

    }
}

client.login(process.env.TOKEN);