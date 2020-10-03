const { TextChannel, NewsChannel } = require("discord.js");

/**
 * @typedef {import("discord.js").Message} Message
 * @typedef {import("discord.js").Client} Client
 * @typedef {import("discord.js").User} User
 * @typedef {import("discord.js").PartialUser} PartialUser
 * @typedef {import("discord.js").Guild} Guild
 * @typedef {import("discord.js").GuildMember} GuildMember
 */

module.exports = {
  /**
   * 
   * @param {Client} bot 
   * @param {User} user 
   */
  findMember(bot, user) {
    /** @type {GuildMember} */
    let found

    bot.guilds.cache.find((guild) => {
      found = guild.members.cache.find((member) => member.user.id === user.id)

      return !!found
    })

    return found
  },
  /**
   * @param {Message} message
   * @param {boolean=} adminOnly
   */
  hasPermission(message, adminOnly) {
    return message.guild.roles.cache
      .filter(
        (role) => role.name === "Admin" || (!adminOnly && role.name === "Mod")
      )
      .reduce((acc, role) => role.members.has(message.author.id) || acc, false);
  },

  /**
   * @param {Message} message
   * @param {string[]} channels
   */
  isValidChannel(message, channels) {
    if (!channels || channels.length === 0) return true;

    return (
      message.guild.channels.cache.find(
        (ch) =>
          !!channels.find((name) =>
            ch.name.toLowerCase().startsWith(name.toLowerCase())
          )
      ) === message.channel
    );
  },

  /**
   * @param {GuildMember} member
   * @param {string[]} roles
   */
  hasRoles(member, roles) {
    if (!roles || roles.length === 0) return true;

    return !!member.roles.cache.find((role) => {
      return !!roles.find((name) =>
        role.name.toLowerCase().startsWith(name.toLowerCase())
      );
    });
  },

  /**
   * @param {Client} bot
   * @param {(User|PartialUser)} user
   */
  commonGuilds(bot, user) {
    return bot.guilds.cache.filter((guild) => guild.members.cache.has(user.id));
  },

  /**
   * @param {import("discord.js").Collection<string, Guild>} guilds
   * @param {(User|PartialUser)} user
   * @param {string=} rolePrefix
   */
  hasRole(guilds, user, rolePrefix) {
    return guilds.find((guild) => {
      const member = guild.members.cache.get(user.id);

      if (!member) return false;

      if (!rolePrefix) return member.roles.cache.size > 0;

      return !!member.roles.cache.find((role) =>
        role.name.startsWith(rolePrefix)
      );
    });
  },

  /**
   * @param {string} name
   * @param {Guild} guild
   */
  findChannel(name, guild) {
    const channel = guild.channels.cache.find((ch) => ch.name.startsWith(name));

    if (channel instanceof TextChannel || channel instanceof NewsChannel) {
      return channel;
    } else {
      throw new Error("Channel not found");
    }
  },
};
