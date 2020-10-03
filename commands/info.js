const { GuildMember } = require("discord.js");
const { validate } = require("email-validator");
const helpers = require("../helpers");
const { getUserEmbed } = require("../users/getUserEmbed");
const db = require("../users/model");

/**
 * @type {import("../bot").Command}
 */
module.exports = {
  roles: ["Admin", "Organizador"],
  channels: ["comandos"],
  usage: "[@usuario | mail@ejemplo.com]",
  description:
    "Brinda información sobre un usuario en particular",
  exec: async ({message, split, bot}) => {
    /** @type {GuildMember} */
    let member
    /** @type {import("../users/model").User} */
    let user

    await message.react("🤖");

    if (split[0].startsWith("@")) {
      member = message.guild.members.cache.find((member) =>
        `@${member.user.tag}` === split[0] ||
        `@${member.user.username}` === split[0]
      );
      user = await db.findMember(member)
    } else if (message.mentions.users.size > 0) {
      member = message.guild.members.cache.find((member) =>
        member.user.id === message.mentions.users.first().id
      );
      user = await db.findMember(member)
    }
    
    if (validate(split[0])) {
      user = await db.findMail(split[0])

      if (user && user.memberid)
        member = message.guild.members.cache.find((member) => member.id === user.memberid)
    }

    if (user || member)
      message.reply("", await getUserEmbed("BLUE", "Información sobre el usuario", user, member))
    else
      message.reply("Usuario no encontrado")
  },
};
