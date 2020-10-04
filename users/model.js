const allSettled = require("promise.allsettled");
const { Sequelize, DataTypes, Op } = require("sequelize");
const pushId = require("unique-push-id");
const db = new Sequelize(process.env.DATABASE_URL, {
  logging: false,
  dialectOptions: {
    ssl: {
          require: true,
          rejectUnauthorized: false
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
 * @typedef {'found' | 'updated' | 'upgraded' | 'invited'} State
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
   * @param {User} user
   */
  async invalidateUser(user) {
    await synced;
    /** @type {Model} */
    // @ts-ignore
    const model = user

    user.memberid = null
    return !!await model.save()
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
    await synced;
    let model = await User.findOne({ where: { mail: mail } });
    /**@type {User}*/
    // @ts-ignore
    let user = model;

    /**@type {State} */
    let state;

    if (model) {
      state = "found";

      if (user.name !== name || user.location !== location) {
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
      /** @type {string} */
      const invite = pushId();

      [user, model] = await this.createUser({
        invite,
        name,
        mail,
        role,
        location,
        lastUpdateCode: code,
        inviteSent: true,
      });


      state = "invited"
    }

    return [state, user, model];
  },

  /**
   * @param {string[]} mails
   * @param {Role} role
   * @return {Promise<[Set<string>, Promise<import("promise.allsettled/types").PromiseResult<void, unknown>[]>, number]>}
   */
  async deleteRemovedUsers(mails, role) {
    await synced;
    const users = await User.findAll({
      where: {
        mail: {
          [Op.notIn]: mails,
        },
        role: role,
      },
    });

    const removedUsers = new Set();

    return [
      removedUsers,
      allSettled(
        users.map((model) => {
          /** @type {User} */
          // @ts-ignore
          const user = model;

          if (user.memberid) removedUsers.add(user.memberid);

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
    await synced;
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

  /**
   * @param {import("discord.js").GuildMember|import("discord.js").User} member 
   * @returns {Promise<User|null>}
   */
  async findMember(member) {
    await synced;
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
    await synced;
    const found = await User.findOne({
      where: {
        mail,
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
    await synced;
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
    await synced;
    const deleted = await User.destroy({
      where: {
        memberid
      },
    });

    return deleted > 0;
  },
};
