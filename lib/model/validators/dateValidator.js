const moment = require('moment')
/**
 * Validator making sure entered text is convertible to a valid date using moment and a date format
 */
class DateValidator {
  /**
   * This method considers as valid dates matching as strictly as momentjs allows the YYYY-MM-DD pattern in
   * field value. Any other pattern should make the field rejected.
   *
   * As an example
   *
   * 2017-09-06 is valid
   * 2017/09/06 is NOT valid
   * 17-09-06 is NOT valid
   * 06-09-2017 is NOT valid
   * 2017-09-06T17:28:30 is NOT valid
   *
   * @see https://en.wikipedia.org/wiki/ISO_8601#Calendar_dates
   */
  static validate (fieldValue, message, resolve, reject) {
    if (moment(fieldValue, 'YYYY-MM-DD').isValid()) {
      resolve('Value is a valid non-empty date')
    } else {
      reject(message)
    }
  }
}

module.exports = DateValidator
