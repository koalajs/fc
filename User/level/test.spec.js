const mod = require('./index')

describe('Level.index', () => {
  it('handler is here', () => {
    expect(typeof(mod.handler)).toBe('function')
  })
})
