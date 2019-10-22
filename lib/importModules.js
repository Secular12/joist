const { readdirSync } = require('fs')

module.exports = (directory, ignore = []) => {
  return readdirSync(directory, { withFileTypes: true })
    .filter(file => file.isDirectory() && !ignore.includes(file))
    .map(dir => require(`${directory}/${dir.name}`))
}
