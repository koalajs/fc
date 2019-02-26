const mod = require('./index')

describe('registerByUP.index', () => {
  it('handler is here', () => {
    expect(typeof(mod.handler)).toBe('function')
  })
})
