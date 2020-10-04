const allSettled = require("promise.allsettled");
const db = require("../users/model");
const { parseDate } = require("../users/parseDate");
const { validate } = require("email-validator");
const { getUserEmbed } = require("../users/getUserEmbed");
const dmCommand = require("../users/dmCommand");
const helpers = require("../helpers");
const { completeUser } = require("../users/completeUser");

/**
 * @type {import("../bot").Command}
 */
module.exports = {
  hidden: true,
  roles: ["Organizador", "Admin"],
  channels: ["comandos"],
  usage: "mail@ejemplo.com 31/12/2000 @participante",
  description:
    "Valida a un usuario",
  exec: async ({ message, split, bot }) => {
    await message.react("🤖");

    if (split.length < 3) {
      return await message.reply("Se necesitan tres parametros para este comando: `[mail] [fecha de nacimiento] @[usuario]\nPor ejemplo: `mail@ejemplo.com 31/12/1999 @participante`")
    }

    /**@type {Date} */
    let date
    /**@type {import("../users/model").User} */
    let user
    /**@type {import("discord.js").GuildMember} */
    let member
    await allSettled(split.map(async (value) => {
      const parse = parseDate(value)

      if (!isNaN(parse)) {
        date = new Date(parse)
        return
      }

      if(validate(value)){
        user = await db.findMail(value)
        if (user) return;

        user = undefined
        return
      }

      const mention = /^<@!?(.+)>$/gi.exec(value)
      if (mention) {
        const foundMember = message.guild.members.cache.get(mention[1])
        if (foundMember) {
          member = foundMember
        }
      }
    }));

    if (!date) {
      return await message.reply("No se encontró una fecha de nacimiento valida, entre los parametros.")
    }

    if (!member) {
      return await message.reply("No se encontró ninguna mención a un miembro del servidor.")
    }

    if (!user) {
      return await message.reply("No se encontró ningún email valido (que pertenezca a un usuario) entre los parametros.")
    }

    const result = await db.completeFromUser(member, user)

    if (result) {
      await completeUser(helpers.findMember(bot, member.user), user)

      const channel = await member.createDM(true)
      await channel.send(dmCommand.dialogs.done)

      return await message.reply("", await getUserEmbed("GREEN", "El usuario fue validado correctamente.", user, member))
    }

    return await message.reply("No se pudo validar el usuario.")
  },
};
