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

    function f1(v) {
      return Promise.resolve(v)
    }
    function f2(v) {
      result = v
    }

    Promise.resolve(123).then(f1).then(f2)
    assert.equal(result, 123)
  })

  it('is replaced with FinishedPromise in async functions', () => {
    let result

    async function f1(v) {
      return v
    }
    async function f2(v) {
      result = v
    }

    Promise.resolve(123).then(f1).then(f2)
    assert.equal(result, 123)
  })
})
