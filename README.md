# finished-promise

Synchronous implementation of [Promise](https://promisesaplus.com/) for use in tests.

Allows testing of asynchronous code in synchronous tests.

Instead of this:

```js
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
```

We can do this:

```js
describe('FinishedPromise', () => {
  it('finishes synchronously, so we can write synchronous tests when we use it in place of Promise', () => {
    let result
    FinishedPromise.resolve(123).then(resolved => {
      result = resolved
    })
    assert.equal(result, 123)
  })
})
```

## async / await

Overriding `global.Promise` has no effect on `async` functions - they will use
the native v8 `Promise` regardless.

To circumvent this limitation we can transpile the source code prior to running
it. Babel can do this, although rather slowly, which would defeat the purpose
of this library - fast tests!

Instead we can use [async-to-gen](https://github.com/leebyron/async-to-gen) which
is actually very fast. See `./mocha` for an example.
