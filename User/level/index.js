const utils = require('@koala.js/fc.utils')
const ts = require('@koala.js/ts-orm')
const config = require('./config')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const R = require('ramda')
let response = null

const handler = async (req, rep, ctx) => {
  response = rep
  ts.orm.init(config.table)
  const data = await utils.getBody(req)
  const checkResult = checkData(data)
  R.unless(isPassCheck, showDataError)(checkResult)
  const token = getToken(req.headers.authorization)
  // 检查token
  const info = jwt.verify(token, config.secret.key)
  // 检查权限，是否有权限修改： 查询数据库， 得到level
  const admin = await getAdmin(info.data)
  const hasAuth = checkAuth(ts.formatRow(admin))
  // 修改内容： update 设定level
  utils.httpSend(rep, { token: token, req: req, data: data, result: info, hasAuth: hasAuth })
}

const showBack = (s, d) => {
  response.setHeader('content-type', 'application/json')
  response.setStatusCode(s)
  response.send(JSON.stringify(d))
}

const getErrorMessage = d => {
  return { message: d.error.details[0]['message'] }
}

const isPassCheck = (d) => R.isNil(d.error)
const showDataError = d => show400(getErrorMessage(d))
const show400 = msg => showBack(400, msg)

const checkData = (d) => {
  return Joi.validate(d, Joi.object().keys({
    uid: Joi.string().required(),
    level: Joi.string().required()
  }))
}

const checkAuth = (admin) => {
  return admin
}

const getAdmin = (uid) => {
  console.log('get uid:', uid)
  // 获取用户的信息
  return new Promise((resolve, reject) => {
    const orm = R.clone(ts.orm)
    orm.table('Auth')
      .versions(1)
      .keys({
        tk: 'user',
        id: uid
      })
      .getRow()
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
  })
}

const getToken = (token) => {
  return token.replace('Bearer ', '')
}

const initializer = (context, callback) => {
  callback(null, '')
}

module.exports = {
  handler,
  initializer
}
