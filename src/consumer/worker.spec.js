const createWorker = require('./worker')

describe('Worker', () => {
  let worker, handler, next, workerId, resolve, reject

  beforeEach(() => {
    resolve = jest.fn(() => {})
    reject = jest.fn(() => {})
    handler = jest.fn(async () => {})
    next = jest.fn(() => undefined)
    workerId = 0
    worker = createWorker({ handler, workerId })
  })

  it('should loop until next() returns undefined', async () => {
    next
      .mockImplementationOnce(() => ({ batch: 'first', resolve, reject }))
      .mockImplementationOnce(() => ({ batch: 'second', resolve, reject }))

    await worker.run({ next })

    expect(next).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenCalledWith('first', { workerId })
    expect(handler).toHaveBeenCalledWith('second', { workerId })
    expect(resolve).toHaveBeenCalledTimes(2)
  })

  it('should not catch handler() exceptions', async () => {
    next.mockImplementationOnce(() => ({ batch: 'first', resolve, reject }))

    const error = new Error('test')
    handler.mockImplementationOnce(async () => {
      throw error
    })

    await worker.run({ next })
    expect(reject).toHaveBeenCalledWith(error)
  })
})
