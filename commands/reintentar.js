const db = require("../users/model");

/**
 * @type {import("../bot").Command}
 */
module.exports = {
  roles: ["Organizador", "Admin"],
  channels: ["comandos"],
  usage: "",
  description:
    "Remueve a todos los usuarios de la base de datos, solo usar para resetear.",
  exec: async ({message}) => {
    await message.react("🤖");
    
    const [sent, missing] = await db.tryInvite()

    message.reply(`Se enviarion ${sent} invitaciones, faltan ${missing}`)
  }
}