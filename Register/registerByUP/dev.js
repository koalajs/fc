// const mod = require('./index')
// 
// const data = {
//   user: 'choufeng1',
//   password: 'xxxxxxcccc',
//   username: 'Jon'
// }
// 
// const main = async () => {
//   const res = await mod.doPutUser(data, 'uuid')
//   console.log('res:', res)
// }
// 
// main()

const ts = require('@koala.js/ts-orm')
const config = require('./config')
const TableStore = require('tablestore')
const putCondition = new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null)
ts.orm.init(config.table)
ts.orm
  .table('Auth')
  .condition(putCondition)
  .keys({
    tk: 'user',
    id: 'xxxxxxxxx'
  })
  .attr([
    {
      'username': 'choufenbgaaa'
    },
    {
      'level': '0'
    }
  ])
  .returnContent({
    returnType: TableStore.ReturnType.Primarykey
  })
  .putRow()
  .then(res => {
    console.log('good')
  })
  .catch(err => {
    console.error('err', err)
  })

