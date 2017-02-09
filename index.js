function FinishedPromise(fn, resolveCallbacks, rejectCallbacks) {
  this.resolved = false
  this.resolveCallbacks = resolveCallbacks || []
  this.rejectCallbacks = rejectCallbacks || []

  var self = this

  function resolve(result) {
    if (!self.resolved) {
      self.result = result
      self.resolved = true
      for (var i = 0; i < self.resolveCallbacks.length; ++i) {
        self.resolveCallbacks[i](result)
      }
    }
  }
  function reject(error) {
    if (!self.resolved) {
      self.error = error
      self.resolved = true
      for (var i = 0; i < self.rejectCallbacks.length; ++i) {
        self.rejectCallbacks[i](error)
      }
    }
  }
  try {
    fn(resolve, reject)
  } catch (e) {
    if ('result' in this) {
      resolve(this.result)
    } else {
      this.error = e
      reject(e)
    }
  }
}

FinishedPromise.prototype.then = function(onFulfilled, onRejected) {
  if (!this.resolved) {
    this.resolveCallbacks.push(onFulfilled)
    if (onRejected)
      this.rejectCallbacks.push(onRejected)
    return this
  }
  if (this.error) {
    return onRejected ? this.catch(onRejected) : this
  }
  return this.constructor.resolve(onFulfilled(this.result))
}

FinishedPromise.prototype.catch = function(onRejected) {
  if (!this.resolved) {
    this.rejectCallbacks.push(onRejected)
    return this
  }
  if (this.error) {
    return this.constructor.resolve( onRejected(this.error))
  }
  return this
}

FinishedPromise.all = function(promiseArray) {
  return new FinishedPromise(function(resolve, reject) {
    var resolved = false
    var results = []
    var count = promiseArray.length
    function waitForResult(i) {
      promiseArray[i].then(function(result) {
        results[i] = result
        count--
        if (count == 0 && !resolved) {
          resolved = true
          resolve(results)
        }
      }).catch(function(error) {
        if (!resolved) {
          resolved = true
          reject(error)
        }
      })
    }
    for (var i = 0; i < promiseArray.length; ++i) {
      waitForResult(i)
    }
  })
}

FinishedPromise.resolve = function(value) {
  if (value && typeof value.then == 'function') {
    return value.then(function(result) { return result })
  }
  return new this(function(resolve) {
    resolve(value)
  })
}

FinishedPromise.reject = function(error) {
  return new this(function(resolve, reject) {
    reject(error)
  })
}

module.exports = FinishedPromise
