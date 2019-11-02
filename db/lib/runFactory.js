const runFactory = (factory, times = 1, accumulator = []) => {
  if (accumulator.length < times) {
    return runFactory(factory, times, [...accumulator, factory(accumulator.length + 1)])
  }
  return accumulator
}

module.exports = runFactory
