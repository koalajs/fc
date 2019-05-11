const config = require('./config')

const handler = (req, rep, ctx) => {
  rep.send({ a: "aaaa"})
}

const initializer = (context, callback) => {
  callback(null, '')
}

module.exports = {
  handler,
  initializer
}
