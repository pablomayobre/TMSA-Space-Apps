const helpers = require("../helpers");
const dmCommand = require("./dmCommand");
const { getUserEmbed } = require("./getUserEmbed");
const db = require("./model");

const add = async (member) => {
  if (member.partial) {
    try {
      await member.fetch();
    } catch (error) {
      console.log("Something went wrong when fetching the member: ", error);
      return;
    }
  }

  if (member.partial === false) {
    const channel = await member.createDM(true);
    const invites = await db.findInvite(member.guild);

    const firstMessage = channel.send(dmCommand.dialogs.welcome);

    if (
      invites.length === 1 &&
      (await db.completeFromUser(member, invites[0]))
    ) {
      await firstMessage;
      await channel.send(dmCommand.dialogs.birthday);
    } else {
      await firstMessage;
      await channel.send(dmCommand.dialogs.notValidated);
    }
  }
}


module.exports = {
  /**
 * @param {import("discord.js").Client} bot
 */
  checkInvite: (bot) => {
    bot.on("guildMemberRemove", async (member) => {
      if (member.partial) {
        try {
          await member.fetch();
        } catch (error) {
          console.log("Something went wrong when fetching the member: ", error);
          return;
        }
      }

      if (member.partial === false) {
        const user = await db.findMember(member);
        helpers
          .findChannel("sistema", member.guild)
          .send(
            "",
            await getUserEmbed(
              "RED",
              "Este usuario ha abandonado el servidor",
              user,
              member
            )
          );

        console.log("Left: ", await db.deleteUserByMember(user.memberid));
      }
    });

    bot.on("guildMemberAdd", async (member) => {
      if (member.partial) {
        try {
          await member.fetch();
        } catch (error) {
          console.log("Something went wrong when fetching the member: ", error);
          return;
        }
      }

      if (member.partial === false) {
        const channel = await member.createDM(true);
        const invites = await db.findInvite(member.guild);

        const firstMessage = channel.send(dmCommand.dialogs.welcome);

        if (
          invites.length === 1 &&
          (await db.completeFromUser(member, invites[0]))
        ) {
          await firstMessage;
          await channel.send(dmCommand.dialogs.birthday);
        } else {
          await firstMessage;
          await channel.send(dmCommand.dialogs.notValidated);
        }
      }
    });
  },
  add,
}
