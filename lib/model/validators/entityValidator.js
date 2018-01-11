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

    if (Array.isArray(args) && entityType !== args[0]) {
      reject('this entity type doesn\'t exists')
      return
    }
    try {
      await entity.isValid()
      resolve('entity is valid')
    } catch (e) {
      reject(message)
    }
  }
}

module.exports = EntityValidator
