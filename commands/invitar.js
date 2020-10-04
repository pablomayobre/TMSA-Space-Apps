const fetch = require("node-fetch");
const xlsx = require("xlsx");
const allSettled = require("promise.allsettled");
const db = require("../users/model");
const { MessageEmbed } = require("discord.js");
const { completeUser } = require("../users/completeUser");

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
  roles: ["Organizador", "Admin"],
  channels: ["comandos"],
  usage: "participante | mentor | sponsor | jurado | organizador <Excel adjunto>",
  description:
    "Invitar miembros con un determinado rol al canal",
  exec: async ({ message, split }) => {
    await message.react("🤖");

    if (message.attachments.size !== 1) {
      return await message.reply(
        "Para usar este comando se debe enviar un (unico) archivo Excel adjunto con los datos necesarios para añadir miembros."
      );
    }

    if (!split[0] || !RoleMap.has(split[0].toLowerCase())) {
      return await message.reply(
        "El rol especificado no es valido, utilice uno de los siguientes: Participante, Organizador, Partocinador, Jurado, Mentor"
      );
    }

    const role = RoleMap.get(split[0].toLowerCase());
    const guild = message.guild;

    console.log("INVITE: Descargando archivo adjunto.")

    const attachment = message.attachments.first();
    const fetched = await fetch(attachment.url)
    const file = await fetched.arrayBuffer();
    const workbook = xlsx.read(file, {type:'buffer'});

    /** @type {ExcelData[]} **/
    const data = xlsx.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]]
    );

    console.log("INVITE: Procesando archivo adjunto.")

    const mails = []
    const results = await allSettled(
      data.map(async ({ Name, Email, Location }) => {
        mails.push(Email);

        return await db.addUser(
          attachment.id,
          Email,
          Name,
          Location,
          role,
          guild
        );
      })
    );

    /**@type {Record<import("../users/model.js").State|"removed"|"error", number>} */
    const count = {
      error: 0,
      removed: 0,
      found: 0,
      updated: 0,
      upgraded: 0,
      invited: 0,
    };

    /** @type {Map<string, import("../users/model").User>} */
    const upgrade = new Map();

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const [state, user] = result.value;

        if ((state === "upgraded" || state === "updated") && user.memberid)
          upgrade.set(user.memberid, user);

        count[state] += 1;
      } else {
        count.error += 1;
      }
    });

    {
      const [
        removedUsers,
        database,
        totalRemoved,
      ] = await db.deleteRemovedUsers(mails, role);

      const updated = []

      const members = guild.members.cache
        .filter((member) => {
          if (upgrade.has(member.id) && member.roles.cache.size > 0) {
            console.log(`INVITE: Actualizando datos de @${member.user.tag}`);
            const user = upgrade.get(member.id);

            updated.push(completeUser(member, user))
          }

          return removedUsers.has(member.id);
        })
        .map((member) => {
          console.log(`INVITE: Kickeando a @${member.user.tag}`);
          return member.kick(
            "Este usuario ya no se encuentra inscripto en el evento."
          );
        });

      await allSettled([members, database, ...updated]);

      count.removed = totalRemoved;
    }

    console.log("INVITE: Comando completado")

    const embed = new MessageEmbed()
      .setTitle("Invitaciones")
      .setDescription("El comando se ejecuto con éxito.")

      .addFields([
        {
          name: "Invitados:",
          value: count.invited,
          inline: true,
        },
        {
          name: "Previamente invitados:",
          value: count.found,
          inline: true,
        },
        {
          name: "Datos Actualizados:",
          value: count.updated,
          inline: true,
        },
        {
          name: "Cambios de Roles:",
          value: count.upgraded,
          inline: true,
        },
        {
          name: "Removidos:",
          value: count.removed,
          inline: true,
        },
        {
          name: "Errores invitando:",
          value: count.error,
          inline: true,
        },
      ])


    return await message.reply("", embed);
  },
};
