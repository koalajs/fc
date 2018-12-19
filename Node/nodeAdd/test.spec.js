const mod = require('./index')

describe('nodeAdd.index', () => {
  it('handler is here', () => {
    expect(typeof(mod.handler)).toBe('function')
  })
})
