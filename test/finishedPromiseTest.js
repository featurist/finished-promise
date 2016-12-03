const assert = require('assert')
const spy = require('./spy')
const Waiter = require('./waiter')
const FinishedPromise = require('..')

describe('Promise', () => {
  it('finishes asynchronously, so we can only write asynchronous tests for code that uses Promise', () => {
    let result
    Promise.resolve(123).then(resolved => {
      result = resolved
    })
    assert.equal(result, undefined)
    return soon(() => assert.equal(result, 123))
  })
})

describe('FinishedPromise', () => {
  it('finishes synchronously, so we can write synchronous tests when we use it in place of Promise', () => {
    let result
    FinishedPromise.resolve(123).then(resolved => {
      result = resolved
    })
    assert.equal(result, 123)
  })
})

function describeSynchronously(Promise, waiter, eventually) {

  describe(`${Promise.name}.resolve(value)`, () => {
    it('invokes the callback passed to .then(...)', () => {
      const outcome = spy(Promise.resolve(42))
      return eventually(() => assert.deepEqual(outcome, { resolves: [42], rejections: [] }))
    })
  })

  describe(`${Promise.name}.reject(error)`, () => {
    it('invokes the callback passed to .catch(...)', () => {
      const outcome = spy(Promise.reject(42))
      return eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [42] }))
    })
  })

  describe(`new ${Promise.name}(...)`, () => {

    context('when the callback resolves immediately', () => {

      it('invokes the callback passed to .then(...) with the value', () => {
        const outcome = spy(new Promise(function(resolve, reject) {
          resolve(123)
        }))
        return eventually(() => assert.deepEqual(outcome, { resolves: [123], rejections: [] }))
      })

    })

    context('when the callback resolves more than once', () => {

      it('only invokes the callback passed to .then(...) once', () => {
        const outcome = spy(new Promise(function(resolve, reject) {
          resolve(1)
          resolve(2)
          resolve(3)
        }))
        return eventually(() =>        assert.deepEqual(outcome, { resolves: [1], rejections: [] }))
          .then(() => eventually(() => assert.deepEqual(outcome, { resolves: [1], rejections: [] })))
      })

    })

    context('when the callback rejects', () => {

      it('invokes the callback passed to .catch(...) with the error', () => {
        const outcome = spy(new Promise(function(resolve, reject) {
          reject(666)
        }))
        return eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [666] }))
      })

    })

    context('when the callback rejects more than once', () => {

      it('only invokes the callback passed to .then(...) once', () => {
        const outcome = spy(new Promise(function(resolve, reject) {
          reject(1)
          reject(2)
          reject(3)
        }))
        return eventually(() =>        assert.deepEqual(outcome, { resolves: [], rejections: [1] }))
          .then(() => eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [1] })))
      })

    })

    context('when the callback throws', () => {

      it('invokes the callback passed to .catch(...) with the error', () => {
        const outcome = spy(new Promise(function(resolve, reject) {
          throw 666
        }))
        return eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [666] }))
      })

    })

    context('when the callback resolves then rejects', () => {

      it('invokes the callback passed to .then(...) with the result', () => {
        const outcome = spy(new Promise(function(resolve, reject) {
          resolve(123)
          reject(666)
        }))
        return eventually(() => assert.deepEqual(outcome, { resolves: [123], rejections: [] }))
      })

    })

    context('when the callback resolves then throws', () => {

      it('invokes the callback passed to .then(...) with the result', () => {
        const outcome = spy(new Promise(function(resolve, reject) {
          resolve(123)
          throw 666
        }))
        return eventually(() => assert.deepEqual(outcome, { resolves: [123], rejections: [] }))
      })

    })

  })

  describe(`new ${Promise.name}(...).then(...)`, () => {

    context('when the first callback resolves', () => {

      it('invokes the second callback with the result', () => {
        const outcome = spy(new Promise(function(resolve, reject) {
          resolve(1)
        }).then(() => 123))
        return eventually(() =>        assert.deepEqual(outcome, { resolves: [123], rejections: [] }))
          .then(() => eventually(() => assert.deepEqual(outcome, { resolves: [123], rejections: [] })))
      })

    })

    context('when the first callback rejects', () => {

      it('does not invoke the second callback', () => {
        const outcome = spy(new Promise(function(resolve, reject) {
          reject(666)
        }).then(() => 123))
        return eventually(() =>        assert.deepEqual(outcome, { resolves: [], rejections: [666] }))
          .then(() => eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [666] })))
      })

    })

  })

  describe(`${Promise.name}.all(promiseArray)`, () => {

    it('resolves with an array of one result after a single promise resolves', () => {
      const promise = waiter()
      const outcome = spy(Promise.all([promise]))
      promise.resolve(42)
      return eventually(() => assert.deepEqual(outcome, { resolves: [[42]], rejections: [] }))
    })

    it('resolves with an array of results after all promises resolve', () => {
      const promise1 = waiter()
      const promise2 = waiter()
      const outcome = spy(Promise.all([promise1, promise2]))
      return eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [] }))
        .then(() => promise1.resolve(123))
        .then(() => eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [] })))
        .then(() => promise2.resolve(456))
        .then(() => eventually(() => assert.deepEqual(outcome, { resolves: [[123, 456]], rejections: [] })))
    })

    it('resolves with a sorted array of results after all promises resolve', () => {
      const promise1 = waiter()
      const promise2 = waiter()
      const outcome = spy(Promise.all([promise1, promise2]))
      return eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [] }))
        .then(() => promise2.resolve(456))
        .then(() => eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [] })))
        .then(() => promise1.resolve(123))
        .then(() => eventually(() => assert.deepEqual(outcome, { resolves: [[123, 456]], rejections: [] })))
    })

    it('rejects with a single error after a single promise rejects', () => {
      const promise = waiter()
      const outcome = spy(Promise.all([promise]))
      promise.reject(42)
      return eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [42] }))
    })

    it('rejects with a single error after one of one promise resolves then one rejects', () => {
      const promise1 = waiter()
      const promise2 = waiter()
      const outcome = spy(Promise.all([promise1, promise2]))
      return eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [] }))
        .then(() => promise2.resolve(456))
        .then(() => eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [] })))
        .then(() => promise1.reject(666))
        .then(() => eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [666] })))
    })

    it('rejects with the first error when more than one promise rejects', () => {
      const promise1 = waiter()
      const promise2 = waiter()
      const outcome = spy(Promise.all([promise1, promise2]))
      return eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [] }))
        .then(() => promise2.reject(456))
        .then(() => eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [456] })))
        .then(() => promise1.reject(123))
        .then(() => eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [456] })))
    })

    it('only rejects with the first error when another promise resolves', () => {
      const promise1 = waiter()
      const promise2 = waiter()
      const outcome = spy(Promise.all([promise1, promise2]))
      return eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [] }))
        .then(() => promise2.reject(456))
        .then(() => eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [456] })))
        .then(() => promise1.resolve(123))
        .then(() => eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [456] })))
    })
  })
}

function describeAsynchronously(Promise, waiter, eventually) {

  describe(`new ${Promise.name}(...)`, () => {

    describe('when the callback eventually resolves', () => {

      it('invokes the callback passed to .then(...) with the value', () => {
        const outcome = spy(new Promise(function(resolve, reject) {
          setTimeout(() => resolve(123), 1)
        }))
        return eventually(() => assert.deepEqual(outcome, { resolves: [123], rejections: [] }))
      })

    })

    describe('when the callback eventually rejects', () => {

      it('invokes the callback passed to .catch(...) with the error', () => {
        const outcome = spy(new Promise(function(resolve, reject) {
          setTimeout(() => reject(666), 1)
        }))
        return eventually(() => assert.deepEqual(outcome, { resolves: [], rejections: [666] }))
      })

    })

  })
}

function immediately(callback) {
  return new FinishedPromise(function(resolve, reject) {
    try {
      callback()
    } catch (e) {
      return reject(e)
    }
    resolve()
  })
}

function soon(callback) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      try {
        callback()
      } catch (e) {
        return reject(e)
      }
      resolve()
    }, 2)
  })
}

describeSynchronously(Promise, () => new Waiter(Promise), soon)
describeSynchronously(FinishedPromise, () => new Waiter(FinishedPromise), immediately)

describeAsynchronously(Promise, () => new Waiter(Promise), soon)
describeAsynchronously(FinishedPromise, () => new Waiter(FinishedPromise), soon)
