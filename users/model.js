const allSettled = require("promise.allsettled");
const { Sequelize, DataTypes, Op } = require("sequelize");
const helpers = require("../helpers");
const sendInvite = require("./sendInvite");
const db = new Sequelize({
  dialect: "sqlite",
  storage: "./spaceapps.sqlite",
  dialectOptions: {
    ssl: {
          require: true,
          rejectUnauthorized: false // <<<<<< YOU NEED THIS
      }
  }
});

/**
 * @type {Record<Role, number>}
 */
const RoleOrder = {
  participant: 0,
  sponsor: 1,
  mentor: 1,
  judge: 1,
  organizer: 2,
};

/**
 * @typedef {'found' | 'updated' | 'upgraded' | 'created' | 'invited'} State
 * 
 * @typedef {"Mendoza"|"Bariloche"|"San Juan"} Location
 *
 * @typedef {"participant"|"sponsor"|"organizer"|"mentor"|"judge"} Role
 *
 * @typedef {Object} User
 * @prop {string} name
 * @prop {string} mail
 * @prop {Role} role
 * @prop {Location} location
 * @prop {string} invite
 * @prop {string|null} memberid
 * @prop {string} lastUpdateCode
 * @prop {boolean} inviteSent
 * @prop {Date|null} birthday
 *
 * @typedef {Object} CreationUser
 * @prop {string} name
 * @prop {string} mail
 * @prop {Role} role
 * @prop {Location} location
 * @prop {string} invite
 * @prop {string|null=} memberid
 * @prop {string} lastUpdateCode
 * @prop {boolean=} inviteSent
 * @prop {Date|null=} birthday
 *
 * @typedef {import("sequelize").Model<User,CreationUser>} Model
 *
 * @typedef {import("sequelize").ModelCtor<Model>} ModelCtor
 */

/** @type {ModelCtor} */
const User = db.define("User", {
  invite: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("participant", "sponsor", "organizer"),
    allowNull: false,
  },
  location: {
    type: DataTypes.ENUM("Mendoza", "Bariloche", "San Juan"),
    allowNull: false,
  },
  memberid: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastUpdateCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  inviteSent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  }
});

const synced = db.sync();

module.exports = {
  /**
   * @param {CreationUser} user
   * @return {Promise<[User, Model]>}
   */
  async createUser(user) {
    await synced;
    const ret = await User.create({ memberid: null, ...user });
    // @ts-ignore
    return [ret, ret];
  },

  /**
   * @param {string} code
   * @param {string} mail
   * @param {string} name
   * @param {Location} location
   * @param {Role} role
   * @param {import("discord.js").Guild} guild
   * @return {Promise<[State, User, Model]>}
   */
  async addUser(code, mail, name, location, role, guild) {
    let model = await User.findOne({ where: { mail: mail } });
    /**@type {User}*/
    // @ts-ignore
    let user = model;

    /**@type {State} */
    let state;

    if (model) {
      state = "found";

      if (user.name !== name || user.location !== location) {
        console.log("UPDATED HERE", name, user.name, location, user.location)
        state = "updated";

        user.name = name;
        user.location = location;
      }

      if (user.role !== role && RoleOrder[user.role] < RoleOrder[role]) {
        state = "upgraded";

        user.role = role;
      }

      user.lastUpdateCode = code;
      model = await model.save();
      // @ts-ignore
      user = model;
    } else {
      state = "created";

      const invite = await helpers.findChannel("bienvenida", guild).createInvite({
        temporary: false,
        maxUses: 1,
        maxAge: 0,
        unique: true,
        reason: `Single use, unique invitation for a new ${role}`,
      });

      const [invited, response] = await sendInvite(
        mail,
        role,
        location,
        invite.code
      );

      console.log("INVITAR: ", mail)
      
      console.log(invited, response);

      [user, model] = await this.createUser({
        invite: invite.code,
        name,
        mail,
        role,
        location,
        lastUpdateCode: code,
        inviteSent: invited,
      });

      if (!invited)
        console.log(`Failed to invite ${name} <${mail}>. Reason: ${response}`);
      else
        state = "invited"
    }

    return [state, user, model];
  },

  /**
   * @param {string} code
   * @param {Role} role
   * @return {Promise<[Set<string>, Set<string>, Promise<import("promise.allsettled/types").PromiseResult<void, unknown>[]>, number]>}
   */
  async deleteRemovedUsers(code, role) {
    const users = await User.findAll({
      where: {
        lastUpdateCode: {
          [Op.not]: code,
        },
        role: role,
      },
    });

    const removedUsers = new Set();
    const removedInvites = new Set()

    return [
      removedUsers,
      removedInvites,
      allSettled(
        users.map((model) => {
          /** @type {User} */
          // @ts-ignore
          const user = model;

          console.log(user.lastUpdateCode, code)

          if (user.lastUpdateCode === code) return;

          if (user.memberid) removedUsers.add(user.memberid);
          if (user.invite) removedInvites.add(user.invite);

          return model.destroy();
        })
      ),
      users.length
    ];
  },

  /**
   * @param {import("discord.js").GuildMember|import("discord.js").User} member
   * @param {User} user
   */
  async completeFromUser(member, user) {
    const [updated] = await User.update(
      { memberid: member.id },
      {
        where: {
          memberid: null,
          mail: user.mail,
          invite: user.invite,
        },
      }
    );

    return updated > 0;
  },

  async tryInvite() {
    const members = await User.findAll({
      where: {
        inviteSent: false
      }
    })

    console.log(members)

    const results = await allSettled(members.map(async (model) => {
      /** @type {User} */
      // @ts-ignore
      const user = model

      const [invited, response] = await sendInvite(
        user.mail,
        user.role,
        user.location,
        user.invite
      );

      if (!invited) throw response;

      user.inviteSent = user.inviteSent || invited
      await model.save()
    }))

    return results.reduce((final, result) => {
      if (result.status === "rejected") {
        final[1] += 1;
        return final
      } else {
        final[0] += 1;
        return final
      }
    }, [0, 0])
  },

  /**
   * @param {import("discord.js").Guild} guild
   * @returns {Promise<User[]>}
   */
  async findInvite(guild) {
    const [invites, queried] = await Promise.all([
      guild.fetchInvites(),
      User.findAll({
        where: { memberid: null },
      }),
    ]);

    /** @type {User[]} */
    // @ts-ignore
    const pending = queried;

    return pending.filter((user) => {
      if (!invites.has(user.invite) || invites.get(user.invite).uses > 0) return true;
      return false;
    });
  },

  /**
   * @param {import("discord.js").GuildMember|import("discord.js").User} member 
   * @returns {Promise<User|null>}
   */
  async findMember(member) {
    const found = await User.findOne({
      where: {
        memberid: member.id
      }
    })

    // @ts-ignore
    return found
  },

  /**
   * @param {import("discord.js").GuildMember|import("discord.js").User} member 
   * @returns {Promise<User|null>}
   */
  async findMail(mail) {
    const found = await User.findOne({
      where: {
        mail,
      }
    })

    // @ts-ignore
    return found
  },

  /**
   * @param {string} code
   * @returns {Promise<User|null>}
   */
  async findCode (code) {
    const found = await User.findOne({
      where: {
        invite: code
      }
    })
    
    // @ts-ignore
    return found
  },

  /**
   * @param {User} user 
   * @param {Date} date 
   */
  async fillBirthday (user, date) {
    const [updated] = await User.update({
      birthday: date
    }, {
      where: {
        invite: user.invite  
      }
    })

    return updated > 0
  },

  /**
   * @param {string} memberid
   */
  async deleteUserByMember(memberid) {
    const deleted = await User.destroy({
      where: {
        memberid
      },
    });

    return deleted > 0;
  },
  /**
   * @param {string} mail
   */
  async deleteUserByMail(mail) {
    const deleted = await User.destroy({
      where: {
        memberid: null,
        mail: mail,
      },
    });

    return deleted > 0;
  },

  clear () {
    return User.destroy({
      where: {},
      truncate: true
    })
  }
};
