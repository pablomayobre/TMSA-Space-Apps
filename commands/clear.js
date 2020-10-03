const db = require("../users/model");

/**
 * @type {import("../bot").Command}
 */
module.exports = {
  hidden: true,
  roles: ["Admin"],
  channels: ["comandos"],
  usage: "",
  description:
    "Remueve a todos los usuarios de la base de datos, solo usar para resetear",
  exec: async ({message}) => {
    await message.react("🤖");

    await message.reply(`Se eliminaron ${await db.clear()} entradas`)
  },
};
