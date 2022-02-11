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
    return new Promise(res => {
        fs.writeFile("data.json", JSON.stringify(data, null, 2), (err) => {
            if(err)
            {
                console.log("Error at writing data");
            }
            res();
           
        });

    });
    
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
        });
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

function aliasToId(alias, guildId)
{
    let aliases = getAllGuildAliases(guildId);
    for(let i = 0; i < aliases.length; i++)
    {
        if(aliases[i].alias == alias)
        {
            return aliases[i].id;

        }
    }
    return null;

}



function aliasExists(guildId, alias)
{
    if(data["g" + guildId] == null)
        return false;
    
    for (var [ingkey, ingvalue] of Object.entries(data["g" + guildId])) 
    {
        if(ingkey.charAt(0) == "u")
        {
            if(ingvalue.aliases == null)
                continue;
            for(let i = 0; i < ingvalue.aliases.length; i++)
            {
                if(ingvalue.aliases[i] == alias)
                    return true;
            }
        }
    }

    return false;
}

function getAllGuildAliases(guildId)
{
    let aliases = [];
    if(data["g" + guildId] == null)
        return aliases;
    
    for (var [ingkey, ingvalue] of Object.entries(data["g" + guildId])) 
    {
        if(ingkey.charAt(0) == "u")
        {
            if(ingvalue.aliases == null)
                continue;
            for(let i = 0; i < ingvalue.aliases.length; i++)
            {
                
                aliases.push({alias: ingvalue.aliases[i], id: ingkey.substring(1)});
            }
        }
    }

    return aliases;
    
}

function getUserAliases(guildId, userId)
{
    if(data["g" + guildId] == null)
        return null;

    if(data["g" + guildId]["u" + userId] == null)
        return null;

    if(data["g" + guildId]["u" + userId].aliases == null)
        return null;
    
    return data["g" + guildId]["u" + userId].aliases;
    
    
}

/**
 * Adds alias to data
 * @param {string}  guildId     Guild id.
 * @param {string}  userId      User id to which add alias
 * @param {string}  alias       The alias you want to add
 * @param {boolean} writeData   Whetever to call WriteData at the end of the function
 * @returns 
 * Object with code and user
 * codes:
 * 0 - Alias already exists in user 
 * 1 - Succsessfuly added alias
 * -1 - Alias already taken by other user (object.user)
 */
async function dataAddAlias(guildId, userId, alias, writeData)
{
    if(data["g" + guildId] == null) 
        data["g" + guildId] = {};


    if(data["g" + guildId]["u" + userId] == null)
        data["g" + guildId]["u" + userId] = {};

    

    

    if(data["g" + guildId]["u" + userId].aliases == null)
        data["g" + guildId]["u" + userId].aliases = [];

    let user = await client.users.fetch(userId);

    if(data["g" + guildId]["u" + userId].aliases.includes(alias)) //Already exists
    {
        return {code: 0, user: user};
    }
    else
    {
        let id = aliasToId(alias, guildId);
        if(id != null)  //Taken
        {
            let us = await client.users.fetch(id);
            return {code: -1, user: us}
        }
        data["g" + guildId]["u" + userId].aliases.push(alias);
        if(writeData)
            writeData();

        return {code: 1, user: user};
    }

}

async function addAlias(msg, words)
{
    let aliases = [];
    let initIndex;
    let id;

    let user = await findUser(words[0], msg.guildId);
    if(user == null)
    {
        initIndex = 0;
        id = msg.author.id;
    }
    else
    {
        initIndex = 1;
        id = user.id;
    }

    let toAdd = words.length-initIndex;
    let succ = 0, exists = 0, taken = 0;

    user = user || msg.author;
    console.log("Adding %d aliases to %s", toAdd,  (user == null) ? msg.author.username : user.username);

    let res = [];
    for(let i = initIndex; i < words.length; i++)
    {
        let result = await dataAddAlias(msg.guildId, id, words[i]);
        res.push(result);
        if(result.code == 1)
            succ++;
        if(result.code == 0)
            exists++;
        if(result.code == -1)
            taken++;
    }

    console.log(succ);
    console.log(exists);
    console.log(taken);

    if(res.length <= 1)
    {
        if(res[0].code == 1)
            msg.channel.send("Added alias " + words[initIndex] + " to " + user.username); 
        if(res[0].code == 0)
            msg.channel.send("Alias alredy exists for user " + user.username);
        if(res[0].code == -1)
            msg.channel.send("Alias already taken by " + res[0].user.username);
    }
    else
    {
        str = "Attemted to add " + res.length + " aliases to " + user.username + ": ";
        let comma = false;
        if(succ > 0)
        {
            str += succ + " successful";
            comma = true;
        }
        if(exists > 0)
        {
            if(comma)
                str += ", "
            str += exists + " already exists";
            comma = true;
        }
        if(taken > 0)
        {
            if(comma)
                str += ", "
            str += taken + " already taken";
        }
        str += "."
        msg.channel.send(str);
    }
    writeData();


   
 
}



function removeAlias(str, guildId)
{
    if(data["g" + guildId] == null)
        return -1;

    for (var [ingkey, ingvalue] of Object.entries(data["g" + guildId])) 
    {
        if(ingkey.charAt(0) == "u")
        {
            if(ingvalue.aliases == null)
                continue;
            for(let i = 0; i < ingvalue.aliases.length; i++)
            {
                if(ingvalue.aliases[i] == str)
                {
                    ingvalue.aliases.splice(i, 1);
                    writeData();
                    return ingkey.substring(1);
                }
            }
        }
    }
    return -1;
}

async function findUser(string, guildId)
{
    let id;
    if(isMention(string))
        id = idFromMention(string);
    else
        id = aliasToId(string, guildId);
    
    if(id == null)
        return null;

    return await client.users.fetch(id);
    
    // return aliasToId(string, guildId);
        
}

async function setPadej(msg, words)
{
    // let id;
    // if(isMention(words[0]))
    // {
    //     id = idFromMention(words[0]);
    // }
    // else
    // {
    //     id = aliasToId(words[0], msg.guildId);
    // }

    // if(id == null)
    // {
    //     console.log("User not found.");
    //     return;
    // }

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
            userID = idFromMention(words[0]);
            
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


    if(data["g" + msg.guildId]["u" + userID].aliases == null)
        data["g" + msg.guildId]["u" + userID].aliases = [];

    let d = (self) ? 0 : 1;

    let id = aliasToId(words[d], msg.guildId);
    if(id != null)
    {
        let us = await client.users.fetch(id);
        msg.channel.send("Padej mush be also an alias, which is taken by " + us.username);
        return;
    }

    if(data["g" + msg.guildId]["u" + userID].padej != null)
    {
        console.log('here ?');
        console.log(removeAlias(data["g" + msg.guildId]["u" + userID].padej, msg.guildId));
    }

    data["g" + msg.guildId]["u" + userID].aliases.push(words[d]);
    data["g" + msg.guildId]["u" + userID].padej = words[d];


    writeData();

    msg.channel.send("Successfuly set padej");


}


async function setWaiting(msg, words)
{
    let id;
    if(isMention(words[0]))
    {
        id = idFromMention(words[0]);
    }
    else
    {
        id = aliasToId(words[0], msg.guildId);
    }

    if(id == null)
    {
        console.log("User not found.");
        return;
    }

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
            id: msg.guildId,
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

async function endWait(guildId, index)
{
    console.log("End start: " + guildId);
    let guild = await client.guilds.fetch(guildId);
    let ch = await client.channels.fetch(data["g" + guildId].active[index].chId);
    let moveto;
    if(data["g" + guildId].moveto != null)
    {
        moveto = await client.channels.fetch(data["g" + guild.id].moveto);
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
            
            for(let k = 0; k < channels.size; k++)
            {
                if(channels.at(k).type == "GUILD_VOICE")
                {
                    moveto = channels.at(k);
                    break;
                }
            }
                
        }
    }
    
    if(moveto == null)
    {
        console.log("error no voice channels");
        return;
    }



    





    for(let j = 0; j < guild.members.cache.size; j++)
    {
        if(guild.members.cache.at(j).voice.channelId == data["g" + guildId].active[index].chId)
            await guild.members.cache.at(j).voice.setChannel(moveto);
    }

    let messageChannel = await client.channels.fetch(data["g" + guildId].active[index].initChId);
    let pad = await getPadejById(guild.id, data["g" + guildId].active[index].userId);
    messageChannel.send("Дождались дебила)");
    ch.delete();
    data["g" + guildId].active.splice(index, 1);

    writeData();


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



async function initCheckGuild(guildId)
{
    return new Promise(async res => 
    {
        let promises = [];
        let gvalue = data["g" + guildId];
        let rewrite = false;
        if(gvalue.active != null && gvalue.active.length > 0)
        {
            for(let i = 0; i < gvalue.active.length; i++)
            {
                
                let p = client.channels.fetch(gvalue.active[i].chId)
                .then(e => {
                    for(let j = 0; j < e.members.size; j++)
                    {
                        if(e.members.at(j).id == gvalue.active[i].userId)
                        {
                            promises.push(endWait(guildId, i));

                            console.log("Channel end wait (%s): " + e.name, "End wait" );
                        }
                    }
                    
                }).catch(e => {
                    if(e instanceof DS.DiscordAPIError)
                    {
                        gvalue.active.splice(i--, 1);
                        rewrite = true;
                    }
                    else
                    {
                        console.log(e);
                    }

                });
                

                
                promises.push(p);
                
                
            }

            Promise.all(promises).then(() => {
                console.log("End promises %d on " + guildId, promises.length);
                
                res(rewrite);

            });

        }
        else
        {
            res(rewrite);
        }
        
        

    });
    
}


client.once('ready', async ()=> 
{
    let cc = 0;
    let promises = []
    for (var [gkey, gvalue] of Object.entries(data)) 
    {
        promises.push(initCheckGuild(gkey.substring(1)));
        
    }
    
    Promise.all(promises).then(arr => 
    {
        for(let i = 0; i < arr.length; i++)
        {
            if(arr[i])
                cc++;
        }
        if(cc > 0)
        {
            console.log("Deleted %d channels", cc);
            writeData();
        }
        
        
        console.log("Ready");

    })

    

    
    // monitor();
});


async function getAliases(msg, words)
{
    console.log(words);
    let user;
    if(words.length > 0)
    {
        user = await findUser(words[0], msg.guildId);
        if(user == null)
        {
            msg.channel.send("User not found");
            return;
        }
    }
    else
    {
        user = msg.author;
    }


    let aliases = getUserAliases(msg.guildId, user.id);
    if(aliases == null || aliases.length == 0)
    {
        msg.channel.send("No aliases for " + user.username + " yet");
        return;
    }
    
    let str = "Aliases for " + user.username + ": [";
    for(let i = 0; i < aliases.length; i++)
    {
        str += "#" + (i+1) + ":" + aliases[i];
        if(i < aliases.length-1)
            str += ", ";
    }
    str += "]";
    msg.channel.send(str);
}




client.on('messageCreate', message => {

    
    if(message.author.id == selfID)
        return;

    let msg = formatText(message.content);


    let words = msg.split(" ");

    
    let fWord = words.shift();

    
    if(fWord == "addalias" || fWord == "addnick" || fWord == "nick" || fWord == "alias" || fWord == "+ник" )
    {
        if(words.length == 0)
        {
            message.channel.send("Incorrect use of addAlias, use /pomogite for help");
            return;
        }
        addAlias(message, words);
    }

    if(fWord == "padej" || fWord == "падеж" || fWord == "+падеж")
    {
        if(words.length == 0)
        {
            message.channel.send("Incorrect use of setPadej, use /pomogite for help");
            return;
        }
        setPadej(message, words);
    }

    if(msg.includes("sosi"))
    {
        console.log(client.channels.cache.at(0).send("hehe"));
        message.channel.send("bibu)");
    }
    
    if(fWord == "ждём" || fWord == "ждать" || fWord == "wait" || fWord == "jdem")
    {
        if(words.length == 0)
        {
            return;
        }
        setWaiting(message, words);
    }
    if(fWord == "moveto")
    {
        if(words.length == 0)
        {
            message.channel.send("Incorrect use of moveto, use /pomogite for help");
            return;
        }
        setMove(message, words);
    }
    if(fWord == "getnicks" || fWord == "ники" || fWord == "aliases")
    {
        getAliases(message, words);
    }

    if(msg.includes("join"))
    {
        let ss = async () => {
            let a = await client.guilds.fetch(message.guildId);
            // console.log(a);
            let con = joinVoiceChannel({
                channelId: words[0],
                guildId: message.guildId,
                adapterCreator: a.voiceAdapterCreator
            });
            let time = 5000;
            if(words[1] != null)
            {
                console.log("a ?");
                time = parseFloat(words[1])*1000;
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

        endWait(guild.id, i);
        
        
        
    }


    
    
});




client.login(process.env.TOKEN);