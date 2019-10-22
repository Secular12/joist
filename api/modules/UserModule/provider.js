const { Injectable } = require('@graphql-modules/di')

class UserProvider {
  constructor () {
    this.users = [
      {
        _id: '1',
        email: 'mark.dekin@gmail.com',
        username: 'mdekin'
      }
    ]
  }

  getUsers () {
    return this.users
  }

  getUserById (id) {
    return this.users.find(user => user._id === id)
  }
}

module.exports = Injectable({})(UserProvider)
