const config = require('./config')
const R = require('ramda')
const utils = require('@koala.js/fc.utils')
const ts = require('@koala.js/ts-orm')
const Joi = require('joi')
const CryptoJS = require('crypto-js')
const jwt = require('jsonwebtoken')

let response = null

const showBack = (s, d) => {
  response.setHeader('content-type', 'application/json')
  response.setStatusCode(s)
  response.send(JSON.stringify(d))
}
const showDataError = d => show400(getErrorMessage(d))
const show400 = msg => showBack(400, msg)
const show403 = msg => showBack(403, msg)
const show200 = msg => showBack(200, msg)
const show500 = msg => showBack(500, msg)
const getErrorMessage = d => {
  return { message: d.error.details[0]['message'] }
}
const isPassCheck = (d) => R.isNil(d.error)
const isPasswordRight = ({ dPass, lPass }) => {
  // 检查密码是否正确, 1. 得到密码字段，2 解密密码，3. 比较
  const bytes = CryptoJS.AES.decrypt(dPass, config.secret.key)
  const pass = bytes.toString(CryptoJS.enc.Utf8)
  // return { d: pass, l: password}
  return R.equals(pass, lPass)
}

const getToken = (userID) => {
  try {
    return jwt.sign({
      data: userID,
      exp: Math.floor(Date.now() / 1000) + (60 * 60)
    }, config.secret.key)
  } catch (err) {
    return null
  }
}

const checkData = (d) => {
  return Joi.validate(d, Joi.object().keys({
    user: Joi.string().required().label('用户名'),
    password: Joi.string().required().label('密码')
  }))
}

const handler = async (req, rep, ctx) => {
  response = rep
  try {
    const data = await utils.getBody(req)
    const checkResult = checkData(data)
    R.unless(isPassCheck, showDataError)(checkResult)
    const result = await ts.orm
      .init(config.table)
      .table('Auth')
      .versions(1)
      .keys({
        tk: 'user_up',
        id: data.user
      })
      .getRow()
    const row = ts.formatRow(result.row)
    // 检查帐号
    R.when(R.isEmpty, () => show403({ message: '帐号输入有误' }))(row)
    // 检查密码
    R.unless(isPasswordRight, () => show403({ message: '密码错误' }))({ dPass: row.password, lPass: data.password })
    // 设计token
    const token = getToken(row.user_id)
    // 检查token
    R.when(R.isNil, () => show500({ message: '生成Token失败' }))(token)
    show200({ token: token, uid: row.user_id })
  } catch (e) {
    show500({ message: '系统错误', e: e })
  }
}

const initializer = (context, callback) => {
  callback(null, '')
}

module.exports = {
  handler,
  initializer
}
