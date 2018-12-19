const config = require('./config')
const utils = require('@koala.js/fc.utils')
const orm = require('@koala.js/fc.utils/ts-orm')
const R = require('ramda')

const handler = async (req, rep, ctx) => {
  const body = await utils.getBody(req)
  checkData || utils.httpSend(rep, { errorMessage: '参数不合法' })
  const data = await putRow(body.keys, body.attr)
  utils.httpSend(rep, data)
  return data
}

const checkData = body => {
  return R.has('keys', body) && R.has('attr', body)
}

const putRow = async (keys, attr) => {
  try {
    const data = await orm.putRow
      .init(config.table)
      .table('Auth')
      .keys(keys)
      .attr(attr)
      .put()
    console.log('put success', data)
    return data
  } catch (err) {
    console.log('put err', err)
    return err
  }
}

const initializer = (context, callback) => {
  callback(null, '')
}

module.exports = {
  handler,
  initializer,
  putRow
}
