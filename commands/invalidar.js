const fetch = require("node-fetch");
const xlsx = require("xlsx");
const allSettled = require("promise.allsettled");
const db = require("../users/model");
const {getRoles} = require("../users/getRoles");
const { MessageEmbed } = require("discord.js");
const { parseDate } = require("../users/parseDate");
const { validate } = require("email-validator");
const { getUserEmbed } = require("../users/getUserEmbed");
const { completeUser } = require("../users/dmCommand");

/** @type {Map<string, import("../users/model").Role>} */
const RoleMap = new Map();
RoleMap.set("organizador", "organizer");
RoleMap.set("organizadores", "organizer");
RoleMap.set("sponsor", "sponsor");
RoleMap.set("sponsors", "sponsor");
RoleMap.set("patrocinador", "sponsor");
RoleMap.set("patrocinadores", "sponsor");
RoleMap.set("participante", "participant");
RoleMap.set("participantes", "participant");
RoleMap.set("jurado", "judge");
RoleMap.set("jurados", "judge");
RoleMap.set("mentor", "mentor");
RoleMap.set("mentores", "mentor");

/**
 * @typedef {Object} ExcelData
 * @property {string} Event
 * @property {string} Name
 * @property {string} Email
 * @property {import("../users/model").Location} Location
 */
/*
  'Registration Date': '08-19-2020',
  'RSVP Status': 'Awaiting Confirmation'
*/

/**
 * @type {import("../bot").Command}
 */
module.exports = {
  hidden: true,
  roles: ["Admin"],
  channels: ["comandos"],
  usage: "mail@ejemplo.com 31/12/2000 @participante",
  description:
    "Valida a un usuario",
  exec: async ({ message, split, bot }) => {
    await message.react("🤖");

    if (split.length === 0) {
      return await message.reply("Se necesitan tres parametros para este comando: `[mail] [fecha de nacimiento] @[usuario]\nPor ejemplo: `mail@ejemplo.com 31/12/1999 @participante`")
    }

    if(validate(split[0])){
      const user = await db.findMail(split[0])
      if (user) {
        await db.invalidateUser(user);
        return await message.reply(await getUserEmbed("ROJO", "Usuario invalidado correctamente", user))
      }
    }
    
    return message.reply("No se encontró al usuario")
  },
};
