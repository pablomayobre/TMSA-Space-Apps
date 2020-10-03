const fetch = require("node-fetch");
const xlsx = require("xlsx");
const allSettled = require("promise.allsettled");
const db = require("../users/model");
const {getRoles} = require("../users/getRoles");
const { MessageEmbed } = require("discord.js");

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
  roles: ["Organizador", "Admin"],
  channels: ["comandos"],
  usage: "[rol] <Excel adjunto>",
  description:
    "Permite invitar miembros con un determinado rol al canal",
  exec: async ({ message, split }) => {
    await message.react("🤖");

    if (message.attachments.size !== 1) {
      return await message.reply(
        "Para usar este comando se debe enviar un (unico) archivo Excel adjunto con los datos necesarios para añadir miembros."
      );
    }

    const rawRole = split[0].toLowerCase();

    if (!RoleMap.has(rawRole)) {
      return await message.reply(
        "El rol especificado no es valido, utilice uno de los siguientes: Participante, Organizador, Partocinador, Jurado, Mentor"
      );
    }

    const role = RoleMap.get(rawRole);
    const guild = message.guild;

    const attachment = message.attachments.first();
    console.log("Hey")
    const fetched = await fetch(attachment.url)
    console.log("fetched")
    const file = await fetched.arrayBuffer();
    console.log("buffer secured")
    const workbook = xlsx.read(file, {type:'buffer'});
    console.log("workbook opened")

    /** @type {ExcelData[]} **/
    const data = xlsx.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]]
    );
    console.log("data secured")

    const results = await allSettled(
      data.map(async ({ Name, Email, Location }) => {
        console.log(`Adding user: ${Name} <${Email}>`);
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
      created: 0,
      invited: 0,
    };
    /** @type {string[]} */
    const notSent = [];

    /** @type {Map<string, import("../users/model").User>} */
    const upgrade = new Map();

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const [state, user] = result.value;

        if ((state === "upgraded" || state === "updated") && user.memberid)
          upgrade.set(user.memberid, user);

        if (state === "created") {
          notSent.push(
            ` - ${user.name} <${user.mail}> - codigo: ${user.invite}`
          );
        }

        console.log("State", state, count[state])
        count[state] += 1;
        console.log("Increased", state, count[state])
      } else {
        count.error += 1;
        console.log("Error en resultados de invitaciones", result.reason)
      }
    });

    {
      const [
        removedUsers,
        removedInvites,
        database,
        totalRemoved,
      ] = await db.deleteRemovedUsers(attachment.id, role);

      const members = guild.members.cache
        .filter((member) => {
          if (upgrade.has(member.id) && member.roles.cache.size > 0) {
            console.log(`Updating ${member.nickname}`);
            const user = upgrade.get(member.id);

            member.setNickname(`${user.name}${user.role === "organizer" ? ' 🚀': ''}`).then((member) => {
              member.roles.set(getRoles(member, guild, user));
            });
          }

          return removedUsers.has(member.id);
        })
        .map((member) => {
          console.log(`Kicking ${member.nickname}`);
          return member.kick(
            "Este usuario ya no se encuentra inscripto en el evento."
          );
        });

      const invites = (await guild.fetchInvites())
        .filter((invite) => {
          return removedInvites.has(invite.code);
        })
        .map((invite) => {
          console.log(`Removed invite ${invite.code}`);
          return invite.delete();
        });

      await allSettled([members, invites, database]);

      count.removed = totalRemoved;
    }

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
          name: "Sin invitar:",
          value: count.created,
          inline: true,
        },
        {
          name: "Errores invitando:",
          value: count.error,
          inline: true,
        },
      ])
      .setFooter(
        notSent.length > 0
          ? `No se pudieron entregar las siguientes invitaciones:
${notSent.join("\n")}`
          : "No quedan invitaciones por entregar"
      );

    return await message.reply("", embed);
  },
};
