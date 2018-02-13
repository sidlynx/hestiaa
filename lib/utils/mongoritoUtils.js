const ActionTypes = require('mongorito').ActionTypes
const CurrentUser = require('./currentUser')

class MongoritoUtils {
  static now () {
    return new Date()
  }

  /**
   * `Mongorito` plugin use to add dynamically traceability fields.
   * Support: *date* and *user* for all *creation* and *update* actions.
   * @param {Array.<string>} triggedActions
   * @private
   */
  static _generateTraceabilityPlugin (triggedActions) {
    return () => store => next => action => {
      if (triggedActions.includes(action.type)) {
        action.fields = action.fields || {}
        if (!MongoritoUtils._isSelfCall(action.fields)) {
          MongoritoUtils._fillFields(store.model, action.fields)
        }
      }

      return next(action)
    }
  }

  /**
   * Like plugin intercept {@link ActionTypes#SET} and call {@link Model#set()} on traceability fields,
   * it's necessary to avoid infinite loop.
   * @private
   */
  static _isSelfCall (fields) {
    let fieldsKeys = Object.keys(fields)
    return fieldsKeys.length === 1 && MongoritoUtils.traceabilityFieldNames.includes(fieldsKeys[0])
  }

  /**
   * @private
   */
  static _fillFields (model, fields) {
    const timestamp = MongoritoUtils.now()
    const userId = CurrentUser.getValue()

    if (!model.get(MongoritoUtils.createdDateFieldName) && !fields[MongoritoUtils.createdDateFieldName]) {
      fields[MongoritoUtils.createdDateFieldName] = timestamp
      model.set(MongoritoUtils.createdDateFieldName, timestamp)
    }

    fields[MongoritoUtils.updatedDateFieldName] = timestamp
    model.set(MongoritoUtils.updatedDateFieldName, timestamp)

    if (userId) {
      if (!model.get(MongoritoUtils.createdByFieldName) && !fields[MongoritoUtils.createdByFieldName]) {
        fields[MongoritoUtils.createdByFieldName] = userId
        model.set(MongoritoUtils.createdByFieldName, userId)
      }

      fields[MongoritoUtils.updatedByFieldName] = userId
      model.set(MongoritoUtils.updatedByFieldName, userId)
    }
  }
}

MongoritoUtils.createdDateFieldName = 'createdAt'
MongoritoUtils.updatedDateFieldName = 'updatedAt'
MongoritoUtils.createdByFieldName = 'createdBy'
MongoritoUtils.updatedByFieldName = 'updatedBy'
MongoritoUtils.traceabilityFieldNames = [MongoritoUtils.createdDateFieldName, MongoritoUtils.updatedDateFieldName, MongoritoUtils.createdByFieldName, MongoritoUtils.updatedByFieldName]

/**
 * Traceability plugin for *root* document.
 * @see MongoritoUtils#_generateTraceabilityPlugin
 */
MongoritoUtils.traceabilityPlugin = MongoritoUtils._generateTraceabilityPlugin([ActionTypes.SAVE])

module.exports = MongoritoUtils
