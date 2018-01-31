const ObjectId = require('mongorito').ObjectId

class ToObjectIdSanitizor {
  /**
   * Sanitizer to turn ObjectId strings into real ObjectId objects
   * @param  {any} value
   * @return {ObjectId|any}
   */
  static toObjectId (value, args) {
    // If it's a valid ObjectId string, convert to an object
    if (typeof value === 'string' && ObjectId.isValid(value)) {
      return new ObjectId(value)
    }

    return value
  }
}

module.exports = ToObjectIdSanitizor
