const Discord = require("discord.js");
const path = require("path");
const credentials = require("./credentials.json");
const dmCommand = require("./users/dmCommand");
const {checkInvite, add} = require("./users/checkInvite");
const helpers = require("./helpers");
const allSettled = require("promise.allSettled")
const db = require("./users/model")

const whitelist = new Set(credentials.whitelist);
const bot = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
const commands = new Map();

const COMMAND_PREFIX = "!";
const commandRegexp = new RegExp(`^\\${COMMAND_PREFIX}(.+)`, "gi");

require("fs")
  .readdirSync(path.join(__dirname, "commands"))
  .forEach((file) => {
    const { name, ext } = path.parse(file);

    if (ext === ".js") {
      commands.set(name, require(`./commands/${file}`));
    }
  });


/**
 * @typedef {import("discord.js").Message} Message
 */

/**
 * @typedef {Object} MessageInfo
 * @property {string} name - The name of the command to be executed
 * @property {Map<string, Command>} commands - A list of all available commands for the bot
 * @property {Message} message - The complete Message object from Discord.js
 * @property {import("discord.js").Client} bot - The instance of the bot that received the message
 * @property {Array<string>} split - The content string of the message split by spaces
 */



/**
 * @typedef {Object} Command
 * @property {string[]} roles - Whether to hide this command to non-Admin users
 * @property {string[]} channels - Whether to hide this command to non-Admin users
 * @property {string} usage - Visual representation of the arguments the command takes
 * @property {string} description - A short description of what the command does
 * @property {(info: MessageInfo) => Promise<Message|Message[]>} exec - A function that takes a MessageInfo object and executes the command
 */

bot.on("message", (message) => {
  if (message.channel.type === "dm") {
    return dmCommand.command(message, message.channel, bot);
  }

  const [name, ...split] = message.content.split(" ");
  const command = commandRegexp.exec(name);
  commandRegexp.lastIndex = 0;

  if (command && commands.has(command[1])) {
    console.log(name)
    const Command = commands.get(command[1])
    
    const validChannel = helpers.isValidChannel(message, Command.channels)
    if (!validChannel) return;

    const permission = helpers.hasRoles(message.member, Command.roles)
    if (!permission) return;

    console.log(Command, permission, validChannel)
    Command.exec({
      name,
      commands,
      message,
      split,
      bot,
    });
  }
});

bot.on("guildCreate", (guild) => {
  if (!whitelist.has(guild.id)) {
    guild.leave();
    console.log(
      `This bot is not allowed to join the server: "${guild.name}" (ID: ${guild.id})`
    );
  }
});

checkInvite(bot)

bot.login(credentials.token);

bot.on("ready", async () =>  {
  console.log(
    `https://discordapp.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=0&scope=bot`
  )

  const guild = bot.guilds.cache.first()

  if (guild) {
    await allSettled(guild.members.cache.map(async (member) => {
      const channel = await member.createDM(true);

      console.log(channel)

      if ((await channel.messages.fetch()).size === 0 || !await db.findMember(member)) {
        return await add(member)
      } else {
        await dmCommand.command(channel.lastMessage, channel, bot)
      }
    }))

    const channel = helpers.findChannel("anuncios", guild)

    await channel.send("Lo siento mucho @everyone! Tuve un problema técnico y me fui a dormir por un rato 😴. Espero no haberles causado muchos problemas 🙏. Ya estoy de vuelta para ayudarlos a validarse y crear sus grupos 🥰.")
  } else {
    console.log("GUILD NOT FOUND")
  }
})



module.exports = bot;
