const mod = require('./index')

describe('nodeDelete.index', () => {
  it('handler is here', () => {
    expect(typeof(mod.handler)).toBe('function')
  })
})
