const DS = require('discord.js');
const { Client, Intents } = require('discord.js');
const fs = require('fs');
require("dotenv").config();


var gmsg;


const selfID = "938855475909386270";

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});




process.stdin.resume();

function exitHandler(options, exitCode) {
    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));



// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));



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
        else
        {
            console.log("Wrote data");
        }
    })
}

var data;
process.stdout.write('\033c');
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
    let channelID = msg.guildId;
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
    
    let ch = data["c" + channelID];

    if(ch == null)
    {
        ch = {
            
        }
    }
    if(ch["u" + userID] == null)
    {
        ch["u" + userID] = {
            aliases : []
        }
    }

    let d = (self) ? 0 : 1;

    if(ch["u" + userID].aliases.includes(words[d]))
    {
        msg.channel.send("Alias already exists");
    }
    else
    {
        ch["u" + userID].aliases.push(words[d]);

        data["c" + channelID] = ch;

        msg.channel.send("Alias successfuly added.");

        writeData();
    }
 
}

function setPadej(msg, words)
{
    let channelID = msg.guildId;
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
    
    let ch = data["c" + channelID];

    if(ch == null)
    {
        ch = {
            
        }
    }
    if(ch["u" + userID] == null)
    {
        ch["u" + userID] = {
            aliases : []
        }
    }

    let d = (self) ? 0 : 1;


    ch["u" + userID].padej = words[d];

    data["c" + channelID] = ch;

    writeData();

    msg.channel.send("Successfuly set padej");


}


function setWaiting(msg, words)
{
    let id = idFromMention(words[0]);
    let padej = getPadejById(msg, id);
    padej = padej.charAt(0).toUpperCase() + padej.slice(1);

    if(padej == null)
    {
        return null;
    }
    let name = "Ждём " + padej;
    

    msg.guild.channels.create(name, {
        type: 'GUILD_VOICE',
        permissionOverwrites: [{
            id: msg.guild.id,
            allow: ['VIEW_CHANNEL']
        }]
    }).then(v => {
        if(data.active == null)
            data.active = [];
        data.active.push({"name" : name, "chId" : v.id, "userId" : id, "startTime" : Date.now(), "gldId" : msg.guildId});
        writeData();
        msg.channel.send("Комната ожидания " + padej);
    });
    
    // console.log(k);
}

function getPadejById(msg, str)
{
    let padej;
    if(data != null)
    {
        if(data["c" + msg.guildId] != null)
        {
            if(data["c" + msg.guildId]["u" + str] != null)
            {
                if(data["c" + msg.guildId]["u" + str].padej != null)
                    return data["c" + msg.guildId]["u" + str].padej;
            }
        } 
    }

    if(msg.mentions.users.size > 0)
    {
        padej = msg.mentions.users.first().username;
    }
    else if(msg.mentions.roles.size > 0)
    {
        padej = msg.mentions.roles.first().name;
    }
    if(padej == null)
    {
        msg.channel.send("Error 100");
        return null;
    }
    return padej + "'a";
}




client.once('ready', ()=> 
{
    
    console.log("Ready");
    monitor();
});


client.on('voiceStateChange', (a, b) => {
    console.log("state");
});

client.on('messageCreate', message => {

    
    if(message.author.id == selfID)
        return;

    let msg = message.content;

    msg = msg.toLowerCase();
    msg = msg.replace(/\s+/g, ' ').trim();

    let words = msg.split(" ");

    

    if(words[0] == "addalias" || words[0] == "addnick")
    {
        addAlias(message, words.splice(1));
    }

    if(words[0] == "setpadej")
    {
        setPadej(message, words.splice(1));
    }

    if(msg.includes("sosi"))
    {
        message.channel.send("bibu)");
    }
    
    if(words[0] == "ждём")
    {
        setWaiting(message, words.splice(1));
    }

    if(msg.includes("check"))
    {
        monitor(message);
        console.log(message.guild.channels.cache);
    }
    

});

var count = 0;
async function monitor(msg)
{
    while(true)
    {
        console.log("--------------------------");

        if(data.active != null && data.active.length > 0)
        {
            for(let i = 0; i < data.active.length; i++)
            {
                for(let j = 0; j < client.guilds.cache.size; j++)
                {
                    let gld = client.guilds.cache.at(j);
                    if(data.active[i].gldId == gld.id)
                    {
                        console.log(gld.channels);
                        // for(let z = 0; z < client.channels.cache.size; z++)
                        // {
                        //     if(client.channels.cache.at(z).id == data.active[i].chId)
                        //     {
                        //         console.log()
                        //         console.log("Here it is(%d): %s:[%s]", z, client.channels.cache.at(z).name, client.channels.cache.at(z).id);
                        //     }
                        // }
                    }
                }
                
            }
            // client.channels.cache.map(e =>{
            //     console.log(e.id)
            // });
            // console.log(data.active);

        }
        count++;
        console.log("--------------------------");
        await sleep(5000);
        

    }
}

client.login(process.env.TOKEN);