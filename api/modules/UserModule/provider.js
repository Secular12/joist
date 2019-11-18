const bcrypt = require('bcrypt')
const { auth } = require('../../../config')
const DatabaseError = require('../../errors/DatabaseError')
const db = require('../../../db')
const { Injectable } = require('@graphql-modules/di')
const softDelete = require('../../../db/lib/modifiers/softDelete')

class UserProvider {
  async createUser (userData) {
    let newUser

    try {
      newUser = await db('users')
        .insert({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          password: await bcrypt.hash(userData.password, auth.saltRounds),
          username: userData.username
        })
    } catch (error) {
      throw new DatabaseError(400, error)
    }

    return newUser
  }

  async getUsers (includeSoftDelete) {
    return db.select().from('users').modify(softDelete, includeSoftDelete)
  }

  async getUserBy (conditions, includeSoftDelete) {
    return db.select().from('users').where(conditions).modify(softDelete, includeSoftDelete).first()
  }

  async getUserById (id, includeSoftDelete) {
    return db.select().from('users').where('id', id).modify(softDelete, includeSoftDelete).first()
  }

  async getUserByUid (uid, includeSoftDelete) {
    return db
      .select()
      .from('users')
      .where('email', uid)
      .orWhere('username', uid)
      .modify(softDelete, includeSoftDelete)
      .first()
  }
}

module.exports = Injectable({})(UserProvider)
