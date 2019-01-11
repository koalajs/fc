const config = require('./config')
const utils = require('@koala.js/fc.utils')
const ts = require('@koala.js/ts-orm')
const TableStore = require('tablestore')

const handler = async (req, rep, ctx) => {
  const res = await ts.orm
    .init(config.table)
    .table('Auth')
    .direction(TableStore.Direction.FORWARD)
    .startKeys({
      tk: 'up',
      id: TableStore.INF_MIN
    })
    .endKeys({
      tk: 'up',
      id: TableStore.INF_MAX
    })
    .limit(100)
    .getRange()
  // 对数据做处理，形成扁平化列表
  const data = ts.formatRange(res) 
  utils.httpSend(rep, data.rows)
}

const initializer = (context, callback) => {
  callback(null, '')
}

module.exports = {
  handler,
  initializer
}
