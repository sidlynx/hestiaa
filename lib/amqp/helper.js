const logger = require('../logging/logger')('AMQP_Helper')

/** Retry pattern */
exports.retryUntilSuccess = async function retryUntilSuccess (asyncFunction, args, delay) {
  const timeoutDelay = delay || 5000
  try {
    return await asyncFunction(args)
  } catch (e) {
    logger.error(e)
    await new Promise(resolve => setTimeout(resolve, timeoutDelay))
    return retryUntilSuccess(asyncFunction, args, timeoutDelay + 5000)
  }
}
