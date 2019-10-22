const { join } = require('path')
require('dotenv').config({ path: join(__dirname, '../.env') })

module.exports = (key, defaultValue = null, type = null) => {
  const computedType = type || typeof defaultValue
  const value = process.env[key]

  if (value === undefined) return defaultValue
  if (computedType === 'boolean') return value.toLowerCase() === 'true'
  if (computedType === 'number') return +value
  return value
}
