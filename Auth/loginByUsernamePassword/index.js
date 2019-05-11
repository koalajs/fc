/**
 * 通过用户名和密码登录，返回生成的token
 *  1. 获取body中的用户名和密码
 *  2. 通过ts获取用户信息进行比较
 *  3. 成功的情况下生成token
 *  3. 完成信息反馈， 成功 + token or错误
 * */
const R = require('ramda')
const utils = require('@koala.js/fc.utils')
const orm = require('@koala.js/fc.utils/ts-orm')
const config = require('./config')
const jwt = require('jsonwebtoken')
const CryptoJS = require('crypto-js')

const handler = async function (req, rep, ctx) {
  const data = await utils.getBody(req)
  // 检查数据合法性
  checkData(data) || utils.httpSend(rep, { errorMessage: '用户名和密码是必须的' }, 403)
  // 获取数据 from tablestore
  const result = await orm.getRow
    .init(config.table)
    .table('Auth')
    .select('user_id')
    .keys({ tk: 'user_up', id: data.user })
    .find()
  // console.log('is right result', result)
  const row = orm.formatRow(result.row)
  // 检查帐号
  checkAccount(rep, row)
  // 检查密码是否正确
  checkPassword(rep, row, data.password)
  // 得到Token
  const token = getToken(rep, data.user)
  // 检查Token
  checkToken(rep, token)
  // 发送Token
  sendToken(rep, token.data)
}

const sendToken = (rep, token) => {
  utils.httpSend(rep, { token: token })
}

const checkToken = (rep, token) => {
  R.isNil(token.data) && utils.httpSend(rep, '生成Token失败')
}

const getToken = (rep, userID) => {
  try {
    const token = jwt.sign({
      data: userID,
      exp: Math.floor(Date.now() / 1000) + (60 * 60)
    }, config.secret.key)
    return { data: token, err: null }
  } catch (err) {
    console.log('Login:loginByUserPassword:Create Token Error', err)
    return { data: null, err: '生成Token出错' }
  }
}

const checkPassword = (rep, row, password) => {
  // 检查密码是否正确, 1. 得到密码字段，2 解密密码，3. 比较
  const dbPass = row.password
  const bytes = CryptoJS.AES.decrypt(dbPass, config.secret.key)
  const pass = bytes.toString(CryptoJS.enc.Utf8)
  R.equals(pass, password) || utils.httpSend(rep, { errorMessage: '密码错误' }, 403)
}

const checkAccount = (rep, row) => {
  R.isEmpty(row) && utils.httpSend(rep, { errorMessage: '帐号不存在' }, 403)
}

const checkData = (d) => {
  return R.and(R.has('user', d), R.has('password', d))
}

module.exports = {
  handler,
  sendToken,
  checkToken,
  getToken,
  checkPassword,
  checkAccount,
  checkData
}
