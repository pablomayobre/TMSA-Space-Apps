const { MessageEmbed } = require("discord.js");
const { ReverseRoleMap } = require("./getRoles");

/**
 * @param {string} color
 * @param {string} description
 * @param {import("./model").User=} user
 * @param {import("discord.js").GuildMember=} member
 */
const getUserEmbed = async (color, description, user, member) => {
  const embed = new MessageEmbed()
  .setDescription(description)
  .setColor(color);

  if (user) {
    embed
      .setTitle(user.name)
      .addFields([
      {
        name: "E-Mail",
        value: user.mail,
        inline: true,
      },
      {
        name: "Localidad",
        value: user.location,
        inline: true,
      },
      {
        name: "Fecha de Nacimiento",
        value: user.birthday,
        inline: true,
      },
      {
        name: "Roles",
        value: ReverseRoleMap.get(user.role),
        inline: true,
      },
      {
        name: "Código de Invitación",
        value: user.invite,
        inline: true,
      },
      {
        name: "Invitación Enviada",
        value: user.inviteSent ? "Si" : "No",
        inline: true,
      },
    ]);
  }

  if (member) {
    embed
      .setTitle(member.nickname)
      .addField("Usuario", `@${member.user.tag}`)
  }

  return embed;
};
exports.getUserEmbed = getUserEmbed;
