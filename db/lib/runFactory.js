const runFactory = (factory, times = 1, accumulator = []) => {
  if (times > 0) {
    return runFactory(factory, times - 1, [...accumulator, factory()])
  }
  return accumulator
}

module.exports = runFactory
