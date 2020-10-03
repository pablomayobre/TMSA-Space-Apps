/** @type {Map<import("../users/model").Role, string>} */
const ReverseRoleMap = new Map();
ReverseRoleMap.set("organizer", "Organizador");
ReverseRoleMap.set("participant", "Participante");
ReverseRoleMap.set("sponsor", "Sponsor");
ReverseRoleMap.set("judge", "Jurado");
ReverseRoleMap.set("mentor", "Mentor");

/**
 * @param {Date} date 
 */
const age = (date) => {
  const today = new Date(Date.now())
  date = new Date(date)

  let years = today.getFullYear() - date.getFullYear()

  let difference = today.getMonth() - date.getMonth()
  if (difference === 0) {
    difference = today.getDate() - date.getDate()
  }

  if (difference < 0) {
    years--
  }

  return years
}

/**
 * @param {import("discord.js").GuildMember} member
 * @param {import("discord.js").Guild} guild
 * @param {import("../users/model").User} user
 */
module.exports = {
  ReverseRoleMap,
  getRoles: (member, guild, user) => {

  const roles = new Set();

  roles.add(ReverseRoleMap.get(user.role));
  if (user.role === "judge" || user.role === "organizer" || user.role === "participant") {
    roles.add(`${ReverseRoleMap.get(user.role)} ${user.location}`);
  }

  if (user.role === "participant") {
    if (user.birthday && age(user.birthday) < 12) {
      roles.add("Menor")
    }

    member.roles.cache.forEach((role) => {
      if (role.name.startsWith(`${user.location} - Grupo`)) roles.add(role.name)
    })
  }

  return guild.roles.cache.filter((role) => roles.has(role.name));
}};
