module.exports = (qb, softDelete = 0, table = null) => {
  const tableNameSpace = table ? `${table}.` : ''

  if (softDelete === 1) {
    qb.whereNotNull(`${tableNameSpace}deleted_at`)
  } else if (softDelete === 0) {
    qb.whereNull(`${tableNameSpace}deleted_at`)
  }
}
