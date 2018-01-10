/**
 * Validator making sure the Entity is Valid
 */
class EntityValidator {
  /**
   * Expect EntityType to exists and to be validated by it's internal validator
   * Mainly used for embedded entities
   */
  static async validate (fieldValue, message, resolve, reject, args) {
    let entity = fieldValue
    let entityType = entity.constructor.name

    try {
      if (Array.isArray(args) && entityType !== args[0]) {
        throw new TypeError('this entity type doesn\'t exists')
      }
      await entity.isValid()
    } catch (e) {
      reject(e)
    }
    resolve('entity is valid')
  }
}

module.exports = EntityValidator
