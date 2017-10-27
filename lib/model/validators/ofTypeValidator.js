/**
 * Validator making sure entered value is of expected type
 */
class OfTypeValidator {
  /**
   * Validates value if it is of type given here
   * @param type {object} the type we want the value to be an instance of
   * @return a function allowing to validate this type, contrary to other validators which are directly usable
   */
  static validate (type) {
    return (fieldValue, message, resolve, reject) => {
      if (fieldValue.constructor.name === type.name) {
        resolve(`value is a ${type.name}`)
      } else {
        reject(message)
      }
    }
  }
}

module.exports = OfTypeValidator
