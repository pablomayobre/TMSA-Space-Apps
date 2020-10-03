const helpers = require("../helpers")

/**
 * @param {import("discord.js").Client} bot 
 */
module.exports = bot =>bot.on("messageReactionAdd", async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.log("Something went wrong when fetching the message: ", error);
      return;
    }
  }

  const message = reaction.message;
  const guilds = helpers.commonGuilds(bot, user);

  if (reaction.emoji.name === "🔔" && message.author.id === bot.user.id) {
    const botReaction = message.reactions.cache.find(
      (react) => react.emoji.name === "🔔" && react.users.cache.has(bot.user.id)
    );

    if (!botReaction) return;

    botReaction.users.remove(bot.user.id);

    // The user needs to share a guild with the bot
    if (guilds.size <= 0) return;
    // If the user has a role, then they are already validated
    if (helpers.hasRole(guilds, user)) return;

    guilds.each(guild => {
      // TODO: CONTACT ORGANZIADORES IN GUILD
    })
  }
});