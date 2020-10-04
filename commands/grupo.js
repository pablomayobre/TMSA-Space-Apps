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
const allSettled = require("promise.allsettled");
const { Categories } = require("../Categories");

/**
 *
 * @param {import("discord.js").Message} message
 * @param {Errors} errors
 * @param {Location} location
 */
const reportErrors = (message, errors, location) => {
  /** @type {import("discord.js").EmbedFieldData[]} */
  const fields = [];

  if (errors.maxQuantity[0]) {
    fields.push({
      name: "El grupo puede tener 6 miembros como máximo:",
      value: ` -  Este grupo tiene ${errors.maxQuantity[0]} miembros`,
    });
  }

  if (errors.noRole.length > 0) {
    fields.push({
      name: "Debe tener el rol de Participante:",
      value: errors.noRole
        .map((member) => ` - ${member.nickname} <@${member.user.tag}>`)
        .join("\n"),
    });
  }

  if (errors.wrongLocation.length > 0) {
    fields.push({
      name: `No se encuentran registrados al evento de ${location}:`,
      value: errors.wrongLocation.map(
        ([location, member]) =>
          ` - ${member.nickname} <@${member.user.tag}> **(${location})**`
      ),
    });
  }

  if (errors.hasGroup.length > 0) {
    fields.push({
      name: "Ya se encuentran en otro grupo:",
      value: errors.hasGroup.map(
        ([group, member]) =>
          ` - ${member.nickname} <@${member.user.tag}> **(${group})**`
      ),
    });
  }

  return message.reply(
    "Lo sentimos",
    new MessageEmbed()
      .setTitle("No se pudo crear el grupo")
      .setDescription("Hubo problemas al crear el grupo:")
      .setColor("RED")
      .addFields(fields)
      .setFooter("Una vez que solucionen estos problemas, intenten de nuevo")
  );
};

const allowModerator = 66584390;
const denyModerator = 2080899255;

const allowWatcher = 37080896;
const denyWatcher = 2110402743;

/**
 * @param {Location} location
 * @param {GuildMember[]} members
 * @param {import("discord.js").Message} message
 */
const createGroup = async (location, members, message) => {
  const guild = members[0].guild;

  const prefix = `${location} - Grupo `;

  const group =
    guild.roles.cache.reduce((current, role) => {
      if (role.name.startsWith(prefix)) {
        return Math.max(current, +role.name.slice(prefix.length));
      }

      return current;
    }, 0) + 1;

  console.log(`GROUP: Creando el grupo ${group} en ${location}`);

  const role = await guild.roles.create({
    data: {
      name: prefix + group,
      color: "DARK_BLUE",
    },

    reason: `Rol especifico para el grupo ${group} de la localidad de ${location}`,
  });

  await allSettled(
    members.map((member) => {
      return member.roles.add(role, "Este miembro forma parte de este grupo");
    })
  );

  /** @type {import("discord.js").OverwriteData[]} */
  const permissionOverwrites = [
    {
      type: "role",
      id: role,
      allow: allowWatcher,
      deny: denyWatcher,
    },
    {
      type: "role",
      id: guild.roles.cache.find((role) => role.name === "Organizador"),
      allow: allowWatcher,
      deny: denyWatcher,
    },
    {
      type: "role",
      id: guild.roles.cache.find((role) => role.name === "Mentor"),
      allow: allowWatcher,
      deny: denyWatcher,
    },
    {
      type: "role",
      id: guild.roles.cache.find((role) => role.name === `Jurado ${location}`),
      allow: allowWatcher,
      deny: denyWatcher,
    },
    {
      type: "role",
      id: guild.roles.cache.find(
        (role) => role.name === `Organizador ${location}`
      ),
      allow: allowModerator,
      deny: denyModerator,
    },
    {
      type: "role",
      id: guild.roles.cache.find((role) => role.name === `Admin`),
      allow: 8,
      deny: [],
    },
    {
      type: "role",
      id: guild.roles.everyone,
      allow: [],
      deny: 2147483639,
    },
  ];

  const parent = Categories.get(location);
  const reason = `Este es el canal creado especificamente para el grupo ${group} de ${location}`;

  console.log("GROUP: Creando canales de texto y voz");
  const [textChannel, voiceChannel] = await allSettled([
    guild.channels.create(`grupo-${group}`, {
      type: "text",
      parent,
      permissionOverwrites,
      reason,
    }),

    guild.channels.create(`voz-grupo-${group}`, {
      type: "voice",
      parent,
      permissionOverwrites,
      reason,
    }),
  ]);

  if (
    textChannel.status === "fulfilled" &&
    voiceChannel.status === "fulfilled"
  ) {
    return await message.reply(
      "Listo tu grupo ha sido creado! ya podes verlo en " +
        textChannel.value.toString()
    );
  }
};

/**
 * @type {import("../bot").Command}
 */
module.exports = {
  hidden: false,
  roles: ["Organizador", "Participante", "Admin"],
  channels: [],
  usage: "@participante...",
  description: "Forma un grupo con los participantes etiquetados",
  exec: async ({ message }) => {
    await message.react("🤖");

    /** @type {Errors} */
    const errors = {
      noRole: [],
      wrongLocation: [],
      maxQuantity: [],
      hasGroup: [],
    };

    /**@type {Record<Location, GuildMember[]>} */
    const locations = {
      Bariloche: [],
      Mendoza: [],
      "San Juan": [],
    };

    let count = 0;

    /**
     * @param {User} user
     */
    const forUser = (user) => {
      const member = message.guild.members.cache.get(user.id);

      if (!member) {
        console.log(`GROUP: Etiqueta erronea: @${user.tag}`);
        return;
      }

      if (!member.roles.cache.find((role) => role.name === "Participante")) {
        errors.noRole.push(member);
        return;
      }

      count++;
      /** @type {Location} */
      let location;
      /** @type {string} */
      member.roles.cache.forEach((role) => {
        const locationResult = /Participante (.+)/gi.exec(role.name);

        if (locationResult && locations[locationResult[1]]) {
          // @ts-ignore
          location = locationResult[1];
        }
      });

      if (!location) {
        console.log(
          `GROUP: Usuario sin ubicación, posiblemente un error @${user.tag}`
        );
        return;
      }

      const prefix = `${location} - Grupo `;
      const group = member.roles.cache.find((role) =>
        role.name.startsWith(prefix)
      );

      if (group) {
        errors.hasGroup.push([
          `Grupo ${group.name.slice(prefix.length)} de ${location}`,
          member,
        ]);
      }

      locations[location].push(member);
    };
    message.mentions.users.forEach(forUser);

    if (
      message.member.roles.cache.find((role) => role.name === "Participante") &&
      !message.mentions.users.has(message.author.id)
    ) {
      forUser(message.author);
    }

    /** @type {[Location, GuildMember[]][]} */
    // @ts-ignore
    const entries = Object.entries(locations).sort((a, b) => {
      return b[1].length - a[1].length;
    });

    if (entries[1][1].length !== 0) {
      entries[1][1].forEach((member) => {
        errors.wrongLocation.push([entries[1][0], member]);
      });
      entries[2][1].forEach((member) => {
        errors.wrongLocation.push([entries[2][0], member]);
      });
    }

    if (count > 6) errors.maxQuantity.push(count);

    if (Object.entries(errors).find(([, values]) => values.length > 0)) {
      console.log("GROUP: No se pudo crear el grupo");
      return await reportErrors(message, errors, entries[0][0]);
    } else {
      // SUCCESS!
      console.log("GROUP: Grupo creado satisfactoriamente");
      const [location, members] = entries[0];

      return await createGroup(location, members, message);
    }
  },
};
