const helpers = require("../helpers");
const dmCommand = require("./dmCommand");
const { getUserEmbed } = require("./getUserEmbed");
const db = require("./model");

module.exports = {
  /**
   * @param {import("discord.js").GuildMember} member
   */
  async removeMember(member) {
    if (member.partial) {
      try {
        await member.fetch();
      } catch (error) {
        console.log("REMOVEMEMBER: Algo salio mal tratando de resolver un miembro parcial.", error);
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

      if (!user) return;
      console.log(`REMOVEMEMBER: @${member.user.tag} ha abandonado el servidor.`, await db.deleteUserByMember(user.memberid));
    }
  },

  /**
   * @param {import("discord.js").GuildMember} member
   */
  async addMember(member) {
    if (member.partial) {
      try {
        await member.fetch();
      } catch (error) {
        console.log("ADDMEMBER: Algo salio mal tratando de resolver un miembro parcial.", error);
        return;
      }
    }

    if (member.partial === false) {
      const channel = await member.createDM(true);

      await channel.send(dmCommand.dialogs.welcome);
      await channel.send(dmCommand.dialogs.email);
    }
  },
};
