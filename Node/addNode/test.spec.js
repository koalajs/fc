const mod = require('./index')
const rep = {
  send: (a) => a,
  setHeader: () => {},
  setStatusCode: () => {}
}
const req = {}
const ctx = {}

describe('addNode.index', () => {
  it('handler is here', () => {
    expect(typeof(mod.handler)).toBe('function')
  })
  it('handler is ok', () => {
    expect(mod.handler(req, rep, ctx)).toBe('function')
  })
  it ('测试putRow', () => {
    expect(typeof mod.putRow()).toBe('object')
  })
})
