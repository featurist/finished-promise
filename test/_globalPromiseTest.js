const assert = require('assert')
const FinishedPromise = require('..')

describe('Promise', () => {
  before(() => {
    FinishedPromise.install()
  })

  after(() => {
    FinishedPromise.uninstall()
  })

  it('is replaced with FinishedPromise', () => {
    let result
    Promise.resolve(123).then(resolved => {
      result = resolved
    })
    assert.equal(result, 123)
  })
})
