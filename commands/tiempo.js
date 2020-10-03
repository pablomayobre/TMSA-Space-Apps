const { MessageEmbed } = require("discord.js");

const getTimeLeft = () => {
  const total = Date.parse('October 4 2020 23:59:00 GMT+0300') - Date.now()

  if (total <= 0) return [0, 0, 0]
  const seconds = Math.floor( (total/1000) % 60 );
  const minutes = Math.floor( (total/1000/60) % 60 );
  const hours = Math.floor( (total/(1000*60*60)) );

  return [hours, minutes, seconds]
}

/**
 * @type {import("../bot").Command}
 */
module.exports = {
  hidden: false,
  roles: [],
  channels: [],
  usage: "",
  description: "Saber cuanto tiempo falta para la entrega",
  exec: async ({ message }) => {
    await message.react("🤖");

    const [horas, minutos, segundos] = getTimeLeft();

    await message.reply(
      new MessageEmbed()
        .setTitle("Tiempo restante")
        .setDescription(
          horas > 0 || minutos > 0 || segundos > 0 ?
          `**La entrega cierra en:**
${horas > 0 ? `${horas} hora${horas !== 1 ? "s" : ""}, ` : ""}${horas > 0 || minutos > 0 ? `${minutos} minuto${
            minutos !== 1 ? "s" : ""
          } y `: ""}${segundos} segundo${segundos !== 0 ? "s" : ""}` : "**La entrega ya cerró**"
        )
        .addField("Horario de cierre:", "23:50h del 4 de Octubre")
        .setFooter("Apurense!")
        .setColor("BLUE")
    );
  },
};
