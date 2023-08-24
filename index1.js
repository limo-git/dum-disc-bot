const Discord = require("discord.js")
const dotenv = require("dotenv")
const {REST} = require("@discordjs/rest")
const {Routes} = require("@discord-api-types/v9")
const fs = require("fs")
const { Player } = require("discord-player")
dotenv.config()
const token = process.env.token
const LOAD_SLASH = process.argv[2] == "load"

const clientId = "1099293847529459763"
const guildId = "1099297370212159500"

const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_VOICE_STATES"
    ]
})

client.slashcommands = new Discord.Collection()
client.player = new Player(CLient, {
    ytdlOptions:{
        quality: "highestaudio",
        highWaterMark: 1<<25
    }
})
let commands = []
const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"))
for (const file of slashFiles){
    const slashcmd = require(`./slash/${file}`)
    client.slashcommands.set(slashcmd.data.name, slashcmd)
    if (LOAD_SLASH) commands.push(slashcmd.data.toJSON())
}
if (LOAD_SLASH) {
    const rest = new REST ({version:"9"}).setToken(token)
    console.log("Deploying slash commands")
    rest.put(Routes.applicationGuildCommands(clientId, guildId)), {body:commands}
    .then(() => {
        console.log("Successfully loaded")
        process.exit(0)
    })
    .catch((err) => {
        console.log(err)
        process.exit(1)
    
    })

}
else { client.on("ready", ()=> {
     console.log(`Logged in as ${client.user.tag}`)

}) 
client.on("interactionCreate", (interaction) => {
    async function handleCommands() {
        if(!interaction.isCommand()) return 
        const slashcmd= client.slashcommands.get(interaction.commandName)
        if(!slashcmd ) interaction.reply("Not a valid slash commands")
        await interaction.deferReply()
        await slashcmd.run({client, interaction})
    }
    handleCommands()
}) 
client.login(token)
}
