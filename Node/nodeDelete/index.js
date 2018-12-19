const config = require('./config')

const handler = (req, rep, ctx) => {
  rep.send(config.base.title)
}

const initializer = (context, callback) => {
  callback(null, '')
}

module.exports = {
  handler,
  initializer
}
