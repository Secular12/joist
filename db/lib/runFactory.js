const runFactory = async (factory, times = 1, accumulator = []) => {
  if (accumulator.length < times) {
    return runFactory(factory, times, [...accumulator, await factory(accumulator.length + 1)])
  }
  return accumulator
}

module.exports = runFactory
