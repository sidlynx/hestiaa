const moment = require('moment')

/**
 * Validator making sure text is a duration conforming with iso spec
 */
class DurationValidator {
  /**
   * Expect the duration to be a valid ISO 8601 duration
   * As an example
   * P0D is valid
   * P1Y5D is valid
   * P51 is NOT valid
   * P1H is NOT valid
   * PT1H is valid
   *
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   */
  static validate (fieldValue, message, resolve, reject) {
    // Thanks to https://stackoverflow.com/a/43528178/15619
    if (fieldValue === 'P0D') {
      resolve('Value is a valid empty duration')
    } else if (moment.duration(fieldValue).toISOString() !== 'P0D') {
      resolve('Value is a valid non-empty duration')
    } else {
      reject(message)
    }
  }
}

module.exports = DurationValidator
