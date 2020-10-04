const helpers = require("../helpers");
const { getRoles } = require("./getRoles");

/**
 * @param {string} name
 */
const sanitizeUsername = (name) => {
  if (name.length > 32) {
    return name.split(" ")[0];
  } else {
    return name;
  }
};

/**
 * @param {import("discord.js").GuildMember} member
 * @param {import("./model").User} user
 */
const completeUser = async (member, user) => {

  member = await member.setNickname(`${sanitizeUsername(user.name)}${user.role === "organizer" ? ' 🚀' : ''}`);

  return await member.roles.set(getRoles(member, member.guild, user));
};

exports.completeUser = completeUser;
