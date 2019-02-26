const config = require('./config')
const utils = require('@koala.js/fc.utils')
const ts = require('@koala.js/ts-orm')
const Joi = require('joi')
const R = require('ramda')
const uuid = require('uuid/v4')
const TableStore = require('tablestore')
const CryptoJS = require('crypto-js')
// const Long = TableStore.Long

let response = null

const showBack = (s, d) => {
  response.setHeader('content-type', 'application/json')
  response.setStatusCode(s)
  response.send(JSON.stringify(d))
}
const showDataError = d => show400(getErrorMessage(d))
const show400 = msg => showBack(400, msg)
const show200 = msg => showBack(200, msg)
const getErrorMessage = d => {
  return { message: d.error.details[0]['message'] }
}

const checkData = d => {
  return Joi.validate(d, Joi.object().keys({
    user: Joi.string().required().label('手机号'),
    password: Joi.string().required().label('密码'),
    username: Joi.string().required().label('姓名')
  }))
}

const getCryptoPass = (password) => {
  return CryptoJS.AES.encrypt(password, config.secret.key).toString()
}

const isPassCheck = (d) => R.isNil(d.error)
const isRegistered = (d) => R.isEmpty(d.row)

const checkRegister = (d) => {
  return new Promise((resolve, reject) => {
    const ts1 = R.clone(ts.orm)
    ts1.table('Auth')
      .versions(1)
      .keys({
        tk: 'user_up',
        id: d.user
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

const putCondition = new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null)
const doPutUserUP = (d, uid) => {
  return new Promise((resolve, reject) => {
    const ts3 = R.clone(ts.orm)
    ts3
      .table('Auth')
      .condition(putCondition)
      .keys({
        tk: 'user_up',
        id: d.user
      })
      .attr([
        {
          'password': getCryptoPass(d.password)
        },
        {
          'user_id': uid
        }
      ])
      .returnContent({
        returnType: TableStore.ReturnType.Primarykey
      })
      .putRow()
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
  })
}

const doPutUser = (d, uid) => {
  console.log('inUserData: ', d, uid)
  return new Promise((resolve, reject) => {
    console.log('inUserData2: ', d, uid)
    const ts2 = R.clone(ts.orm)
    ts2
      .table('Auth')
      .condition(putCondition)
      .keys({
        tk: 'user',
        id: uid
      })
      .attr([
        {
          'username': d.username
        },
        {
          'level': TableStore.Long.fromNumber(0)
        }
      ])
      .returnContent({
        returnType: TableStore.ReturnType.Primarykey
      })
      .putRow()
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
  })
}

const handler = async (req, rep, ctx) => {
  response = rep
  ts.orm.init(config.table)
  const data = await utils.getBody(req)
  console.log('show Data2:', data)
  const checkResult = R.tap(checkData((a) => console.log(`data in :${a}`), data))
  R.unless(isPassCheck, showDataError)(checkResult)
  const didRegisteredResult = await checkRegister(data)
  R.unless(isRegistered, () => show400({ message: '已经注册过, 无需重复注册' }))(didRegisteredResult)
  const uid = uuid()
  console.log('show Data3:', data, uid)
  const res = await doPutUser(data, uid)
  const resUP = await doPutUserUP(data, uid)
  show200({ d: data, u: uid, r: res, up: resUP })
}

const initializer = (context, callback) => {
  callback(null, '')
}

module.exports = {
  handler,
  initializer,
  doPutUser
}
