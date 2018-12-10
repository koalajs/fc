const CryptoJS = require("crypto-js")
const config = require('./config')

const pass = CryptoJS.AES.encrypt('123123', config.secret.key)

console.log(pass.toString())
