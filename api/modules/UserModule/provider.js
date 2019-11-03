const db = require('../../../db')
const { Injectable } = require('@graphql-modules/di')

class UserProvider {
  async getUsers () {
    return db.select().from('users')
  }

  async getUserById (id) {
    return db.select().from('users').where('id', id).first()
  }
}

module.exports = Injectable({})(UserProvider)
