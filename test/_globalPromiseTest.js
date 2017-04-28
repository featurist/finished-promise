const assert = require('assert')
const FinishedPromise = require('..')

describe('Promise', () => {
  const nativeThen = Promise.prototype.then
  before(() => {
    Promise.prototype.then = function () {
      throw new Error("native Promise still alive and kicking")
    }
    FinishedPromise.install()
  })

  after(() => {
    FinishedPromise.uninstall()
    Promise.prototype.then = nativeThen
  })

  it('is replaced with FinishedPromise', () => {
    let result
    Promise.resolve(123).then(resolved => {
      result = resolved
    })
    assert.equal(result, 123)
  })

  it('is replaced with FinishedPromise in async functions (failing)', () => {
    let result

    async function f(resolved) {
      result = resolved
    }
    Promise.resolve(123).then(f)
    assert.equal(result, 123)
  })
})
