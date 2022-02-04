const DS = require('discord.js');
const { Client, Intents } = require('discord.js');

const token = "OTM4ODU1NDc1OTA5Mzg2Mjcw.YfwXTA.nebMWsN1pOYB3eCtO5-9J4eSsR0";

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});



client.once('ready', ()=> {
    console.log("ready");
});

client.on('messageCreate', message => {

    let msg = message.content;

    msg = msg.toLowerCase();
    msg = msg.replaceAll(" ", "");

    if(msg == "sosi")
    {
        message.reply("bibu");
    }
    

});

client.login(token);