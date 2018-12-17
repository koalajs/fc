const mod = require('./index')

describe('loginByUserPassword', () => {
  it('handler is here', () => {
    expect(typeof(mod.handler)).toBe('function')
  })
  it('checkAccount is here', () => {
    expect(typeof(mod.checkAccount)).toBe('function')
  })
})
