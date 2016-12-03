module.exports = function spy(promise) {
  const outcome = { resolves: [], rejections: [] }
  promise
    .then(value => {
      outcome.resolves.push(value)
    })
    .catch(error => {
      outcome.rejections.push(error)
    })
  return outcome
}
