const db = require("../users/model");

/**
 * @type {import("../bot").Command}
 */
module.exports = {
  hidden: true,
  roles: ["Organizador", "Admin"],
  channels: ["comandos"],
  usage: "",
  description:
    "Reintentar enviar todas las invitaciones por mail",
  exec: async ({message}) => {
    await message.react("🤖");
    
    const [sent, missing] = await db.tryInvite()

    message.reply(`Se enviarion ${sent} invitaciones, faltan ${missing}`)
  }
}