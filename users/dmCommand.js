const helpers = require("../helpers");
const {getRoles} = require("./getRoles");
const { getUserEmbed } = require("./getUserEmbed");
const db = require("./model")
const validator = require("email-validator").validate

/**
 * @typedef {import("./model").Location|"Moron"|"La Plata"|"Buenos Aires"|"Rosario"|"Córdoba"} AllLocations
 */

/** @type {Map<string, AllLocations[]>} */
const ValidLocations = new Map()

ValidLocations.set("caba", ["Buenos Aires"])
ValidLocations.set("buenos aires", ["Moron", "La Plata", "Buenos Aires"])
ValidLocations.set("catamarca", ["San Juan", "Mendoza"])
ValidLocations.set("chaco", ["San Juan", "Mendoza"])
ValidLocations.set("chubut", ["Bariloche"])
ValidLocations.set("cordoba", ["Córdoba"])
ValidLocations.set("córdoba", ["Córdoba"])
ValidLocations.set("cÓrdoba", ["Córdoba"])
ValidLocations.set("corrientes", ["San Juan", "Mendoza"])
ValidLocations.set("entre rios", ["San Juan", "Mendoza"])
ValidLocations.set("entre ríos", ["San Juan", "Mendoza"])
ValidLocations.set("entre rÍos", ["San Juan", "Mendoza"])
ValidLocations.set("formosa", ["San Juan", "Mendoza"])
ValidLocations.set("jujuy", ["San Juan", "Mendoza"])
ValidLocations.set("la pampa", ["San Juan", "Mendoza"])
ValidLocations.set("pampa", ["San Juan", "Mendoza"])
ValidLocations.set("la rioja", ["San Juan", "Mendoza"])
ValidLocations.set("rioja", ["San Juan", "Mendoza"])
ValidLocations.set("mendoza", ["Mendoza"])
ValidLocations.set("misiones", ["San Juan", "Mendoza"])
ValidLocations.set("neuquen", ["Bariloche", "Mendoza"])
ValidLocations.set("neuquén", ["Bariloche", "Mendoza"])
ValidLocations.set("neuquÉn", ["Bariloche", "Mendoza"])
ValidLocations.set("rio negro", ["Bariloche"])
ValidLocations.set("río negro", ["Bariloche"])
ValidLocations.set("rÍo negro", ["Bariloche"])
ValidLocations.set("salta", ["San Juan", "Mendoza"])
ValidLocations.set("san juan", ["San Juan"])
ValidLocations.set("san luis", ["San Juan", "Mendoza"])
ValidLocations.set("santa cruz", ["Bariloche"])
ValidLocations.set("santa fe", ["Rosario"])
ValidLocations.set("santiago del estero", ["San Juan", "Mendoza"])
ValidLocations.set("tierra del fuego", ["Bariloche"])
ValidLocations.set("tucumán", ["San Juan", "Mendoza"])
ValidLocations.set("tucuman", ["San Juan", "Mendoza"])
ValidLocations.set("tucumÁn", ["San Juan", "Mendoza"])

/**
 * @typedef {import("discord.js").Message} Message
 */
const DIALOGS = {
  welcome: `**Este es un mensaje automático de The Mars Society Argentina**

Bienvenido a nuestro servidor de Discord. Este va a ser el principal medio de comunicación para las localidades de Bariloche, San Juan y Mendoza durante el NASA SpaceApps Challenge.`,

  notValidated: `Hemos tenido inconvenientes validando tu correo electrónico.

Si no te ha llegado una invitación por correo electrónico, es posible que no estés inscripto correctamente al evento.
De ser así, te sugerimos buscar la localidad más cercana en http://argentina.marssociety.org/spaceapps y registrarte al evento.
      
Si recibiste una invitación al correo, respondé este mensaje con: **SPACEAPPS**`,

  codeInvalid: `Código inválido, intentalo nuevamente. Si este problema continúa, comunicate con un organizador o con @mars.argentina en Instagram o Facebook.`,

  codeValid: `¡Excelente! Para terminar la validación, respondé con el correo electrónico con el que te registraste al NASA SpaceApps Challenge.`,

  emailInvalid: `Este correo electrónico es incorrecto, por favor intentalo de nuevo. Si este problema continúa, comunicate con un organizador o con @mars.argentina en Instagram o Facebook.`,

  validated: `¡Perfecto! Hemos terminado la validación.`,

  birthday: `Antes de continuar, te vamos a pedir algunos datos extra que nos permitirán brindarte una mejor experiencia.

El primer dato a ingresar será tu fecha de nacimiento, pero ¡ESPERÁ!

Por favor, decinos la verdad. No hay ningún tipo de requisito de edad para participar en este evento, pero el conocer este dato nos ayuda a los organizadores a brindarte una mejor experiencia.

Respondé a este mensaje con la fecha, deberás hacerlo en el formato día/mes/año, por ejemplo, 31/12/2000.
`,

  birthdayInvalid: `Al parecer, la fecha no tiene el formato correcto, intentalo de nuevo, recordando que el formato es día/mes/año (ej.: 31/12/2000).`,

  birthdayValid: `Muy bien, ahora solo resta un dato más.

Respondé este mensaje con el nombre de tu provincia o CABA, según donde vivas:`,

  locationInvalid: `Esta provincia no es valida, intentalo de nuevo. El valor que ingreses, debe ser una **provincia** de Argentina, y su nombre debe estar escrito correctamente.`,

  /**
   * @param {string[]} options
   */
  locationIsFar: (options) => `Tu provincia se encuentra alejada del evento al que te has inscripto. El evento más cercano es el de ${options[1] ? `${options[0]} o el de ${options[1]}` : options[0]}.

Si deseás cambiarte a alguno de estos eventos podés hacerlo en
${options.map((option) => ` - ${option}: <https://2020.spaceappschallenge.org/locations/${option.toLowerCase().replace(" ", "-")}/event`).join("\n")}>`,

  done: `¡Genial! Ahora sí, finalmente podemos darte la bienvenida formal al evento.

Ya podés ingresar a los canales del servidor y comenzar a trabajar.

Es un placer tenerte, esperamos que te diviertas.

*Volver al servidor:* <https://discordapp.com/channels/745778390933438535/745778707360383076/757399278250491916>`
}

const STAGES = {
  [DIALOGS.notValidated.substr(0, 10)]: 1,
  [DIALOGS.codeInvalid.substr(0, 10)]: 1,

  [DIALOGS.codeValid.substr(0, 10)]: 2,
  [DIALOGS.emailInvalid.substr(0, 10)]: 2,

  [DIALOGS.birthday.substr(0, 10)]: 3,
  [DIALOGS.birthdayInvalid.substr(0, 10)]: 3,

  [DIALOGS.birthdayValid.substr(0, 10)]: 4,
  [DIALOGS.locationInvalid.substr(0,10)]: 4,

  [DIALOGS.done.substr(0, 10)]: 5,

  [DIALOGS.welcome.substr(0, 10)]: 0,
  [DIALOGS.validated.substr(0, 10)]: 3,
  ["Tu provinc"]: 0,
}


/**
 * @param {Message[]} messages 
 * @param {string} email
 */
const isValidCode = async (messages, email) => {
  const code = messages.reduce(/**
    * @param {false|Message} found
    * @param {Message} current
    */
    (found, current) => {
    if (found && found.author.bot)
      return current;

    if (!found && current.author.bot && current.content.trim().substr(0, 10) === DIALOGS.codeValid.substr(0, 10))
      return current;

    return found;
  }, false);

  if (code) {
    if (code.content.trim() === "SPACEAPPS") return true;
    
    const user = await db.findCode(code.content.trim())

    if (user.mail === email) return true;
    return true;
  } else
    return false;
}

/**
 * @param {import("discord.js").Client} bot 
 * @param {import("discord.js").User} author 
 * @param {import("./model").User} user 
 */
const completeUser = async (bot, author, user) => {
  let member = helpers.findMember(bot, author)

  member = await member.setNickname(`${user.name}${user.role === "organizer" ? ' 🚀': ''}`)

  return await member.roles.set(getRoles(member, member.guild, user));
}

/**
 * @param {string} mail
 */
const sanitizeEmail = (mail) => {
  if (validator(mail))
    return mail;
}
 /**
 * @param {import("discord.js").DMChannel} channel 
 * @returns {Promise<[number, Message[]]>}
 */
const getStageAndMessages = async (channel) => {
  const allMessages = (await channel.messages.fetch()).array().sort((first, second) => {
    return second.createdTimestamp - first.createdTimestamp
  });

  const lastBotMessage = allMessages.find((message) => message.author.bot).content.trim().substr(0, 10)
  const stage = STAGES[lastBotMessage]

  console.log(lastBotMessage, stage);

  return [stage, allMessages]
}

/**
 * @param {string} text
 */
const parseDate = (text) => {
  const parse = (/(..?)\/(..?)\/(....)/gi).exec(text)
  return parse ? Date.parse(`${parse[2]}-${parse[1]}-${parse[2]}`) : NaN
}

module.exports = {
  completeUser,
  getStageAndMessages,
  parseDate,
  /**
 * @param {Message} message 
 * @param {import("discord.js").DMChannel} channel 
 * @param {import("discord.js").Client} bot 
 */
  command: async (message, channel, bot) => {
    if (message.author.bot === true || channel.recipient.bot === true) return;

    const user = await db.findMember(message.author)

    const [stage, allMessages] = await getStageAndMessages(channel)

    if (stage === 0 || stage === 5) return;

    if (user && (stage === 1 || stage === 2)) {
      await channel.send(DIALOGS.validated)
      await channel.send(DIALOGS.birthday)

      return;
    }

    switch (stage) {
      case 0: return;

      case 1: {
        if (message.content.trim() === "SPACEAPPS" || !!await db.findCode(message.content.trim())) {
          await channel.send(DIALOGS.codeValid);
        } else {
          await channel.send(DIALOGS.codeInvalid)
        }
      } break;

      case 2: {
        const email = sanitizeEmail(message.content.trim())
        const user = await db.findMail(email)

        if (!user) {
          await channel.send(DIALOGS.emailInvalid)
          break
        }

        isValidCode(allMessages, user.mail)

        if (email === user.mail && user.memberid === null && db.completeFromUser(message.author, user)) {
          await channel.send(DIALOGS.validated)
          await channel.send(DIALOGS.birthday)
        } else {
          await channel.send(DIALOGS.emailInvalid)
        }
      } break;

      case 3: {
        const date = parseDate(message.content.trim())

        if (!isNaN(date)) {
          db.fillBirthday(user, new Date(date))

          await channel.send(DIALOGS.birthdayValid)
        } else {
          await channel.send(DIALOGS.birthdayInvalid)
        }
      } break;

      case 4: {
        const locations = ValidLocations.get(message.content.trim().toLowerCase())

        if (locations) {
          if (locations.findIndex((value) => value === user.location) === -1) {
            await channel.send(DIALOGS.locationIsFar(locations))
          }

          await channel.send(DIALOGS.done)
          await completeUser(bot, message.author, user)

          const member = helpers.findMember(bot, message.author)
          const systemChannel = helpers.findChannel("sistema", member.guild)
          await systemChannel.send("", await getUserEmbed("GREEN", "Este usuario ha sido validado", user, member))
        } else {
          await channel.send(DIALOGS.locationInvalid)
        }

      } break;
    }
  },

  dialogs: DIALOGS
}