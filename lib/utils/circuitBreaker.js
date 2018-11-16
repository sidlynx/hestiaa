const request = require('request-promise')
const logger = require('../logging/logger')

/**
 * Implementation of "circuit breaker" pattern: retry + sleep + temporary deactivation
 * @see request-promise
 */
class CircuitBreaker {
  /**
   * Returns the default configuration of the Circuit Breaker
   *
   * @return {Objet} the default configuration
   */
  static getDefaultConfiguration () {
    return { attemptsCount: 3, sleepTime: 200, deactivateAfter: 6, reactivateAfter: 30000 }
  }

  /**
   * Process `request`.
   *
   * @param {(requestPromise.RequestPromiseOptions & request.RequiredUriUrl)} requestOptions Parameter for `request-promise`
   * @param {Object} [cbOpts] Parameter for circuit-breaker execution
   * @param {number} cbOpts.attemptsCount Number of calls to retry.
   * @param {number} cbOpts.sleepTime Time to wait between 2 attempts. In milliseconds.
   * @param {number} cbOpts.deactivateAfter Number of attempts before deactivation.
   * @param {number} cbOpts.reactivateAfter Time to wait before reactivation. In milliseconds.
   * @param {number} cbOpts.serviceId Identifier used to identity target HTTP resource. To use when `requestOptions.url` is complex (with path or query parameters).
   * @return {Promise<object>}
   * @throws Last error if none of previous was successful
   */
  static async request (requestOptions, cbOpts = {}) {
    cbOpts = Object.assign(CircuitBreaker.getDefaultConfiguration(), cbOpts) // default

    let id = cbOpts.serviceId || requestOptions.baseUrl || requestOptions.url

    CircuitBreaker._checkOrUpdateDeactivation(id, cbOpts.reactivateAfter)

    // retry pattern
    for (let i = cbOpts.attemptsCount - 1; i >= 0; i--) {
      try {
        let result = await request(requestOptions)
        delete CircuitBreaker._failsCounter[id]
        return result
      } catch (e) {
        // deactivation if necessary
        CircuitBreaker._failsCounter[id] = (CircuitBreaker._failsCounter[id] || 0) + 1
        if (CircuitBreaker._failsCounter[id] >= cbOpts.deactivateAfter) {
          CircuitBreaker._deactivationDate[id] = Date.now()
        }

        if (i === 0) {
          // last chance
          throw e
        } else {
          logger.warn(e.stack)
          await new Promise(resolve => setTimeout(resolve, cbOpts.sleepTime))
        }
      }
    }
  }

  /**
   * @param {string} id
   * @private
   */
  static _checkOrUpdateDeactivation (id, reactivateAfter) {
    let deactivationDate = CircuitBreaker._deactivationDate[id]
    if (deactivationDate) {
      if (deactivationDate + reactivateAfter < Date.now()) {
        delete CircuitBreaker._deactivationDate[id]
      } else {
        throw new CircuitBreakerError('Deactivated because of many fails')
      }
    }
  }
}

/**
 * @type {{string: number}}
 * @private
 */
CircuitBreaker._failsCounter = {}

/**
 * Timestamp of deactivation.
 * @type {{string: number}}
 * @private
 */
CircuitBreaker._deactivationDate = {}

class CircuitBreakerError extends Error {}

CircuitBreaker.CircuitBreakerError = CircuitBreakerError

module.exports = CircuitBreaker
