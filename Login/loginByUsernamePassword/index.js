/**
 * 通过用户名和密码登录，返回生成的token
 *  1. 获取body中的用户名和密码
 *  2. 通过ts获取用户信息进行比较
 *  3. 成功的情况下生成token
 *  3. 完成信息反馈， 成功 + token or错误
 * */
const R = require('ramda')
const utils = require('@koala.js/fc.utils')
const config = require('./config')
const TableStore = require('tablestore')
const jwt = require('jsonwebtoken')
const CryptoJS = require("crypto-js")

module.exports.handler = async function (req, rep, ctx) {
  const data = await utils.getBody(req)
  // 检查数据合法性
  checkData(data) || utils.httpSend(rep, {msg: '手机号和密码是必须的'}, 403)
  // 初始化数据库 
  const ts =  await init()
  // 获取数据 from tablestore
  const row = await getTableRow(ts, data)
  // 报错提示
  checkErr (rep, row)
  // 检查帐号
  checkAccount (rep, row)
  // 检查密码是否正确
  checkPassword (rep, row, data.password)
  //得到Token
  const token = getToken (rep, data.phone)
  // 检查Token
  checkToken (rep, token)
  // 发送Token
  sendToken (rep, token.data)
}


const sendToken = (rep, token) => {
  utils.httpSend(rep, {token: token})
}

const checkToken = (rep, token) => {
  R.isNil(token.data) && utils.httpSend(rep, '生成Token失败')
}

const getToken = (rep, phone) => {
  try {
    const token = jwt.sign({phone: phone, iat: Math.floor(Date.now() / 1000) - 30}, config.secret.key)
    return {data: token, err: null}
  } catch (err) {
    console.log('Login:loginByUserPassword:Create Token Error', err)
    return {data: null, err: '生成Token出错'}
  }
}

const checkPassword = (rep, row, password) => {
  // 检查密码是否正确, 1. 得到密码字段，2 解密密码，3. 比较
  const item = R.find(R.propEq('columnName', 'password'))(row.data.attributes)
  const dbPass = item.columnValue
  const bytes = CryptoJS.AES.decrypt(dbPass, config.secret.key)
  const pass = bytes.toString(CryptoJS.enc.Utf8)
  R.equals(pass, password) || utils.httpSend(rep, {err: '密码错误'}, 403)
}

const checkAccount = (rep, row) => {
  R.isEmpty(row.data) && utils.httpSend(rep, { err: '帐号不存在'}, 403)
}

const checkErr = (rep, row) => {
  if (R.isNil(row.data)) {
    console.log('Login:loginByUserPassword:TableStore Error', row.err)
    utils.httpSend(rep, {err: '数据库访问出错'})
  }
}

// 用于获取用户信息
const getTableRow = async (ts, data) => {
  const params = {
    tableName: 'Auth',
    primaryKey: [
      { tk: 'up' },
      { id: data.phone}
    ],
    maxVersions: 1
  }
  params.columnsToGet = ['password', 'username'] 
  try {
    const d = await ts.getRow(params)
    return {data: d.row, err: null}
  } catch (err) {
    return {data: null, err: 'TableStore has some err'}
  }
}

const temp = () => {
  const bytes = CryptoJS.AES.decrypt(row.row.attributes[0].columnValue, config.secret.key)
  const str = bytes.toString(CryptoJS.enc.Utf8)
}

const checkData = (d) => {
  return R.and(R.has('phone', d), R.has('password', d))
}

const init = () => {
  return new Promise((resolve, reject) => {
    const ts = new TableStore.Client({
      accessKeyId: config.table.accessKeyId,
      secretAccessKey: config.table.secretAccessKey,
      endpoint: config.table.endpoint,
      instancename: config.table.instancename
    })
    resolve(ts)
  })
}
