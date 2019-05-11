const mod = require('./index')

describe('GoTest.index', () => {
  it('handler is here', () => {
    expect(typeof(mod.handler)).toBe('function')
  })
})
