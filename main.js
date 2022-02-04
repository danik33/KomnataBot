const DS = require('discord.js');
const { Client, Intents } = require('discord.js');
const fs = require('fs');
require("dotenv").config();


const selfID = "938855475909386270";

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});


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
    if(str.startsWith("<@!") && str.endsWith(">") && str.length > 20 && str.length < 25)
        return true;
    return false;
}

function addAlias(msg, words)
{
    let channelID = msg.guildId;
    let userID;
    if(words.length == 1)
    {
        if(isMention(words[0]))
            msg.channel.send("Incorrect use of addAlias, use /pomogite for help");
        else
            userID = msg.author.id;
        
    }
    else
    {
        
        return;
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
    if(ch["u" + userID].aliases.includes(words[0]))
    {
        msg.channel.send("Alias already exists");
    }
    else
    {
        ch["u" + userID].aliases.push(words[0]);

        data["c" + channelID] = ch;

        msg.channel.send("Alias successfuly added.");
    
        writeData();
    }




    
        


}


client.once('ready', ()=> 
{
    
    console.log("Ready");
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

    if(msg.includes("sosi"))
    {
        message.channel.send("bibu)");
    }
    

});

client.login(process.env.TOKEN);