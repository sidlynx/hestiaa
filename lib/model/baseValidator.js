const indicative = require('indicative')
const ValidationHelper = require('./validators/validationHelper')
const OfTypeValidator = require('./validators/ofTypeValidator')
const DurationValidator = require('./validators/durationValidator')
const ObjectIdValidator = require('./validators/objectIdValidator')
const DateValidator = require('./validators/dateValidator')
const Base64Validator = require('./validators/base64Validator')

const ToIntOptionalSanitizor = require('./sanitizors/toIntOptionalSanitizor')

indicative.extend('dateObject', ValidationHelper.inIndicative(OfTypeValidator.validate(Date)), 'Value should be a Javascript date')
indicative.extend('objectIdString', ValidationHelper.inIndicative(ObjectIdValidator.validate), 'Value should be a string containing a valid ObjectId')
indicative.extend('durationString', ValidationHelper.inIndicative(DurationValidator.validate), 'Value should be a string containing a valid ISO-8601 duration')
indicative.extend('dateString', ValidationHelper.inIndicative(DateValidator.validate), 'Value should be a string containing a valid ISO-8601 date')
indicative.extend('base64', ValidationHelper.inIndicative(Base64Validator.validate), 'Value should be a string with Base64 format')
indicative.sanitizor.extend('toIntOptional', ToIntOptionalSanitizor.toIntOptional)

/**
 * Base class to create attribute validators. By extending this class and
 * implementing the `validations` and `sanitizations` method it's possible to
 * have versatile validators for different entities
 */
class BaseValidator {
  /**
   * Return the validation rules for homebook/* entity
   *
   * @see http://indicative.adonisjs.com/
   * @return {object} Simple rules object following indicative semantics
   */
  static validations () {
    throw new Error(`The class '${this.constructor.name}' has no 'validations()' method.
One good implementation could be

  /**
   * Get validations for ${this.constructor.name}
   * @return map of validations for field
   */
  validations() {
    // // for example (see http://indicative.adonisjs.com/#indicative-basics-schema for more examples)
    // return {
    //   'type': 'required|in:foo,bar,baz',
    //   'name': 'required|string'
    // }
    return {}
  }
`)
  }

  /**
   * Return the sanitization rules for homebook/* entity
   *
   * @see http://indicative.adonisjs.com/
   * @return {object} Simple rules object following indicative semantics
   */
  static sanitizations () {
    throw new Error(`The class '${this.constructor.name}' has no 'sanitizations()' method.
One good implementation could be

  /**
   * Get sanitizations for ${this.constructor.name}
   * @return map of sanitizations for field
   */
  sanitizations() {
    // // for example (see http://indicative.adonisjs.com/#indicative-sanitizor-using-schema for more examples)
    // return {
    //    email: 'normalize_email',
    //    age: 'to_int',
    //    aboutme: 'strip_links'
    //   'date': 'toDate'
    // }
    return {}
  }
`)
  }

  static async sanitize (attributes) {
    return indicative.sanitize(attributes, this.sanitizations())
  }

  /**
   * Performs validation
   *
   * @param  {object} Entity attributes
   * @return {Array} Validation error messages
   */
  static async getErrors (attributes) {
    try {
      await indicative.validateAll(attributes, this.validations())
    } catch (errors) {
      return errors.map(error => error.message)
    }

    return []
  }
}

module.exports = BaseValidator
