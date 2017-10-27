/**
 * Helper transforming the simple validate function returned by validators into an indicative validation function
 */
class ValidationHelper {
  /**
   * Create the function chain allowing the given validation function to be invoked in indicative
   * @param validationFunction {function} validation function to be invoked. This function is expected to
   * have the following prototype : validationFunction(fieldValue, message, resolve, reject) where fieldValue is
   * the non undefined field value, message is the error message to show, and resolve and reject are two closures to be
   * invoked when validation either succeed or fail
   * @return an indicative validation function running the given validationFunction object to validate fields
   */
  static inIndicative (validationFunction) {
    return function (data, field, message, args, get) {
      return new Promise(function (resolve, reject) {
        // get value of field under validation
        const fieldValue = get(data, field)

        if (!fieldValue) {
          return resolve('validation skipped due to missing value')
        }

        validationFunction(fieldValue, message, resolve, reject)
      })
    }
  }
}

module.exports = ValidationHelper
