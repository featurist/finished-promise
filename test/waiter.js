function Waiter(Promise) {
  const waiter = this
  this.promise = new Promise(function(resolve, reject) {
    waiter.resolve = resolve
    waiter.reject = reject
  })
}
Waiter.prototype.then = function(callback, errorCallback) {
  return this.promise.then(callback, errorCallback)
}
Waiter.prototype.catch = function(errorCallback) {
  return this.promise.catch(errorCallback)
}

module.exports = Waiter
