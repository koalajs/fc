const config = require('./config')
const utils = require('@koala.js/fc.utils')
const orm = require('@koala.js/fc.utils/ts-orm')
const TableStore = require('tablestore')

const handler = async (req, rep, ctx) => {
  const res = await orm.getRange
    .init(config.table)
    .table('Auth')
    .start({
      tk: 'up',
      id: TableStore.INF_MIN
    })
    .end({
      tk: 'up',
      id: TableStore.INF_MAX
    })
    .find()
  utils.httpSend(rep, res)
}

const initializer = (context, callback) => {
  callback(null, '')
}

module.exports = {
  handler,
  initializer
}
