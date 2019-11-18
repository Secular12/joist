const bcrypt = require('bcrypt')
const { auth } = require('../../../config')
const DatabaseError = require('../../errors/DatabaseError')
const db = require('../../../db')
const { Injectable } = require('@graphql-modules/di')
const withTrashed = require('../../../db/lib/modifiers/withTrashed')

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

  async deleteUserById (userId) {
    await db('users').where('id', userId).del()
  }

  async getUsers (includeTrashed) {
    return db('users').select().modify(withTrashed, includeTrashed)
  }

  async getUserBy (conditions, includeTrashed) {
    return db('users').select().where(conditions).modify(withTrashed, includeTrashed).first()
  }

  async getUserById (id, includeTrashed) {
    return db('users').select().where('id', id).modify(withTrashed, includeTrashed).first()
  }

  async getUserByUid (uid, includeTrashed) {
    return db('users')
      .select()
      .where('email', uid)
      .orWhere('username', uid)
      .modify(withTrashed, includeTrashed)
      .first()
  }
}

module.exports = Injectable({})(UserProvider)
