const { uniq } = require('lodash')

module.exports = obj => {
  return uniq(obj
    .map(o => JSON.stringify(o))
  )
    .map(o => JSON.parse(o))
}
