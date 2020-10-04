const { MessageEmbed } = require("discord.js");
const helpers = require("../helpers");
const { completeUser } = require("./completeUser");
const { getUserEmbed } = require("./getUserEmbed");
const db = require("./model");
const { parseDate } = require("./parseDate");
const validator = require("email-validator").validate

/**
 * @typedef {import("discord.js").Message} Message
 */

const DIALOGS = {
  welcome: `**Este es un mensaje automático de The Mars Society Argentina**

Bienvenido a nuestro servidor de Discord. Este va a ser el principal medio de comunicación para las localidades de Bariloche, San Juan y Mendoza durante el NASA SpaceApps Challenge.`,

  email: `Para validarte, necesito que me digas cual es tu e-mail (el que usaste para registraste al NASA SpaceApps Challenge). Por ejemplo: **mail@ejemplo.com**`,

  emailInvalid: `Este correo electrónico es incorrecto, asegurate que está vien escrito y que sea con el que te registraste al Space Apps Challenge, en las localidades de Mendoza, San Juan o Bariloche. De no ser así, no estás autorizado a entrar al servidor.`,

  birthday: `Listo! Ahora ingresá tu fecha de nacimiento (no es necesario que mientas) con el formato: dia/mes/año. Por ejemplo: **31/12/1999**`,

  birthdayInvalid: `Al parecer, la fecha no tiene el formato correcto, intentalo de nuevo, recordando que el formato es día/mes/año y el año deberá tener los 4 dígitos.`,

  done: `¡Genial! Ya podés ingresar a los canales del servidor y comenzar a trabajar.

Es un placer tenerte, esperamos que te diviertas.

*Volver al servidor:* <https://discordapp.com/channels/745778390933438535/745778707360383076/757399278250491916>`
}

const STAGES = {
  [DIALOGS.email.substr(0, 10)]: 1,
  [DIALOGS.emailInvalid.substr(0, 10)]: 1,

  [DIALOGS.birthday.substr(0, 10)]: 2,
  [DIALOGS.birthdayInvalid.substr(0, 10)]: 2,

  [DIALOGS.done.substr(0, 10)]: 3,

  [DIALOGS.welcome.substr(0, 10)]: 0,
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
 * @returns {Promise<number>}
 */
const getStage = async (channel) => {
  const allMessages = (await channel.messages.fetch()).array().sort((first, second) => {
    return second.createdTimestamp - first.createdTimestamp
  });

  const message = allMessages.find((message) => message.author.bot)

  if (!message) return 1;
  
  const lastBotMessage = message.content.trim().substr(0, 10)
  const stage = STAGES[lastBotMessage]

  return stage
}

module.exports = {
  /**
 * @param {Message} message 
 * @param {import("discord.js").DMChannel} channel 
 * @param {import("discord.js").Client} bot 
 */
  command: async (message, channel, bot) => {
    if (message.author.bot === true || channel.recipient.bot === true) return;

    const user = await db.findMember(message.author)

    const stage = await getStage(channel)

    if (stage === 0 || stage === 3) return;

    if (user && user.birthday){
      await channel.send(DIALOGS.done)

      return;
    }

    if (user && stage === 1) {
      await channel.send(DIALOGS.birthday)

      return;
    }

    switch (stage) {
      case 0: return;

      case 1: {
        const email = sanitizeEmail(message.content.trim())
        const user = await db.findMail(email)

        if (user && email === user.mail && user.memberid === null && await db.completeFromUser(message.author, user)) {
          await channel.send(DIALOGS.birthday)
        } else {
          await channel.send(DIALOGS.emailInvalid)
          
          const member = helpers.findMember(bot, message.author)

          if (member) {
            const systemChannel = helpers.findChannel("sistema", member.guild)

            await systemChannel.send("", new MessageEmbed().setColor("RED").setTitle("Error de validación").setDescription("Un usuario tiene problemas validando su e-mail.").addField("Usuario:", `@${message.author.tag}`).addField("Correo Electrónico:", message.content.trim()))
          }
        }
      } break;

      case 2: {
        const date = parseDate(message.content.trim())

        if (!isNaN(date)) {
          await db.fillBirthday(user, new Date(date))
          await completeUser(helpers.findMember(bot, message.author), user)

          await channel.send(DIALOGS.done)

          const member = helpers.findMember(bot, message.author)
          
          if (member) {
            const systemChannel = helpers.findChannel("sistema", member.guild)
            await systemChannel.send("", await getUserEmbed("GREEN", "Este usuario ha sido validado", user, member))
          }
        } else {
          await channel.send(DIALOGS.birthdayInvalid)
        }
      } break;
    }
  },

  dialogs: DIALOGS
}