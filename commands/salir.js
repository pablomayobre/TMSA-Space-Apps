const { MessageEmbed } = require("discord.js");
const allSettled = require("promise.allsettled");
/**
 * @typedef {import("discord.js").GuildMember} GuildMember
 * @typedef {import("discord.js").User} User
 * @typedef {import("../users/model").Location} Location
 *
 * @typedef {[Location, GuildMember]} Entry
 * 
 * @typedef {{hasGroup: [string, GuildMember][], maxQuantity: number[], noRole: GuildMember[], wrongLocation: Entry[]}} Errors
 */

const { Categories } = require("../Categories");

/**
 * @type {import("../bot.js").Command}
 */
module.exports = {
  hidden: false,
  roles: ["Participante"],
  channels: [],
  usage: "",
  description:
    "Salir del grupo en el que estés actualmente",
  exec: async ({message}) => {
    await message.react("🤖");
    const member = message.member
    const group = member.roles.cache.find((role) =>
      /(.+) - Grupo (.+)/gi.test(role.name)
    );

    if(!group) {
      return message.reply("Actualmente no eres parte de un grupo.")
    }

    const [,groupLocation, groupNumber] = /(.+) - Grupo (.+)/gi.exec(group.name)

    await member.roles.remove(group);

    if (group.members.size === 0) {
      await group.delete()

      // @ts-ignore
      const category = message.guild.channels.resolve(Categories.get(groupLocation))
      if (category && category.type === "category") {
        
        const textChannel = message.guild.channels.cache.find((channel) => {
          return channel.parent && channel.parent.id === category.id &&
            channel.name === `grupo-${groupNumber}`
        })

        const voiceChannel = message.guild.channels.cache.find((channel) => {
          return channel.parent && channel.parent.id === category.id &&
            channel.name === `voz-grupo-${groupNumber}`
        })

        await allSettled([textChannel.delete(), voiceChannel.delete()])
      }
    } else {
      // @ts-ignore
      const category = message.guild.channels.resolve(Categories.get(groupLocation))
      if (category && category.type === "category") {
        
        /** @type {import("discord.js").TextChannel} */
        // @ts-ignore
        const textChannel = message.guild.channels.cache.find((channel) => {
          return channel.parent && channel.parent.id === category.id &&
            channel.name === `grupo-${groupNumber}`
        })
        
        if (textChannel.type === "text") {
          textChannel.send("", new MessageEmbed().setTitle("Se ha ido un miembro.").setDescription(`${member.nickname} <@${member.user.tag}> ha abandonado el grupo.`).setColor("RED"))
        }
      }
    }
  }
}