module.exports = (qb, withTrashed = 0, table = null) => {
  const tableNameSpace = table ? `${table}.` : ''

  if (withTrashed === 1) {
    qb.whereNotNull(`${tableNameSpace}deleted_at`)
  } else if (withTrashed === 0) {
    qb.whereNull(`${tableNameSpace}deleted_at`)
  }
}
