require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js')
const { TOKEN_DISCORD, CHANNELID_DISCORD } = process.env

class LoggerService{

    //create discord client instance
    constructor(){
        this.client = new Client({
            intents:[
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        })
        this.chanelId=CHANNELID_DISCORD
        //wait for event ready and log user tag to console
        this.client.on('ready',()=>{
            console.log(`logged is at ${this.client.user.tag}`)
        })

        this.client.login(TOKEN_DISCORD)
    }

    sendToFormatCode(logData){
        const { code, message = 'This is some additional information about the code.', title = 'Code Example'} = logData
        if( 1 === 1) {
            //product and dev
        }
        const codeMessage = {
            content:message,
            embeds:[
                {
                    color:parseInt('00ff00',16),
                    title,
                    description:'```json\n' + JSON.stringify(code, null, 2) + '\n```',
                },
            ],
        }
        this.sendToMessage( codeMessage)
    }

    sendToMessage(message = 'message'){
        const channel = this.client.channels.cache.get(this.chanelId)
        if(!channel){
            console.error(`Couldn't find the channel ...`,this.chanelId)
            return
        }
        //message use chat gpt api call to level up
        channel.send(message).catch(e => console.error(e))
    }
}

module.exports = new LoggerService()