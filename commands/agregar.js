/**
 * @typedef {import("discord.js").GuildMember} GuildMember
 * @typedef {import("discord.js").User} User
 * @typedef {import("../users/model").Location} Location
 *
 * @typedef {[Location, GuildMember]} Entry
 *
 * @typedef {{hasGroup: [string, GuildMember][], maxQuantity: number[], noRole: GuildMember[], wrongLocation: Entry[]}} Errors
 */

const { MessageEmbed } = require("discord.js");

/** @type {Set<Location>} */
// @ts-ignore
const Locations = new Set(["Mendoza", "Bariloche", "San Juan"])

const { Categories } = require("../Categories");
const ReverseCategories = new Map([...Categories.entries()].map(([location, id]) => [id, location]))

/**
 * @type {import("../bot").Command}
 */
module.exports = {
  hidden: false,
  roles: ["Organizador", "Participante", "Admin"],
  channels: [],
  usage: "@participante...",
  description:
    "Agrega a los usuarios mencionados al grupo del que formas parte",
  exec: async ({message}) => {
    await message.react("🤖");
    const prevMember = message.member;

    let group, groupLocation
    if (prevMember.roles.cache.find((role) => role.name === "Organizador" || role.name === "Admin")){
      const groupChannel = message.channel

      if (groupChannel.type === "dm") return await message.reply("Este comando no funciona por mensajes privados.");

      const result = /grupo-(.+)/.exec(groupChannel.name)
      groupLocation = groupChannel.parentID && ReverseCategories.get(groupChannel.parentID)

      console.log("RESULT", result)
      console.log(groupLocation, groupChannel.parentID)

      if (!result || !groupLocation) return await message.reply("Los organizadores solo pueden usar este comando en un canal de grupo.");
      
      group = message.guild.roles.cache.find((role) =>
        role.name === `${groupLocation} - Grupo ${result[1]}`
      );
    } else {
      group = prevMember.roles.cache.find((role) =>
        /(.+) - Grupo (.+)/gi.test(role.name)
      );

      if (!group) {
        return await message.reply("Primero debés formar parte de un grupo. Podes usar el comando `!grupo` y mencionar a tus compañeros.")
      }

      [,groupLocation] = /(.+) - Grupo (.+)/gi.exec(group.name)
    }

    if (message.mentions.users.size <= 0) {
      return await message.reply("Se necesita mencionar a uno o más miembros, para agregarlos al equipo")
    }

    if (group.members.size === 6) {
      return await message.reply("Este grupo ya se encuentra lleno.")
    }

    if (group.members.size + message.mentions.users.size > 6) {
      return await message.reply("No se pueden agregar a estos usuarios, ya que se excede el cupo máximo por grupo (6 personas).")
    }

    let showSuccess = false
    const success = new MessageEmbed().setTitle("Agregados correctamente").setColor("GREEN").setDescription("Los siguientes usuarios se agregaron correctamente:")
    
    let showErrors = false
    const errors = new MessageEmbed().setTitle("Se encontraron errores").setColor("RED").setDescription("Los siguientes usuarios no se pudieron agregar al grupo:")

    message.mentions.users.forEach((user) => {
      const member = message.guild.members.cache.find((member) => member.id === user.id);

      let isParticipant
      let location
      let hasGroup

      member.roles.cache.forEach((role) => {
        if (role.name === "Participante") {
          isParticipant = true
        }

        const locationResult = (/Participante (.+)/gi).exec(role.name)
        const groupResult = (/(.+) - Grupo (.+)/gi).exec(role.name)

        if (groupResult) {
          hasGroup = groupResult[2]
        }

        // @ts-ignore
        if (locationResult && Locations.has(locationResult[1])) {
          location = locationResult[1]
        }
      });

      if (!isParticipant) {
        showErrors = true;
        return errors.addField(`${member.nickname} <@${member.user.tag}>`, "No es un participante.")
      }

      if (!location) {
        showErrors = true;
        return errors.addField(`${member.nickname} <@${member.user.tag}>`, "No pudimos detectar la ubicación de este participante.")
      }

      if (location !== groupLocation) {
        showErrors = true;
        return errors.addField(`${member.nickname} <@${member.user.tag}>`, `Este participante está inscripto al evento de ${location}.`)
      }

      if (hasGroup) {
        showErrors = true;
        return errors.addField(`${member.nickname} <@${member.user.tag}>`, `Este participante ya es miembro del grupo ${hasGroup}.`)
      }

      showSuccess = true;
      success.addField(`${member.nickname} <@${member.user.tag}>`, "Agregado con éxito.")
      return member.roles.add(group, "Este miembro ahora forma parte del grupo.")
    })

    const embeds = []

    if (showSuccess) embeds.push(success);
    if (showErrors) embeds.push(errors)

    return await message.reply("", embeds)
  }
}