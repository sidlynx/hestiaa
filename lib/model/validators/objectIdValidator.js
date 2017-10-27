const ObjectId = require('mongorito').ObjectId

/**
 * Validator making sure text is an ObjectId conforming with with mongorito spec
 */
class ObjectIdValidator {
  /**
   * Expect the duration to be a valid ObjectId
   */
  static validate (fieldValue, message, resolve, reject) {
    if (ObjectId.isValid(fieldValue)) {
      resolve('Value is a valid non-empty ObjectId')
    } else {
      reject(message)
    }
  }
}

module.exports = ObjectIdValidator
