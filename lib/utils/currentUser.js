const cls = require('cls-hooked')

const namespace = cls.createNamespace('hestiaa')
const KEY = 'tokenPayload.user'

/**
 * Module used to store and access to "current user" anywhere into the application.
 *
 * This avoid to use a `userId` parameter on each functions across application,
 * and especially when a function cannot be directly called passing this value (like `mongorito` plugin).
 *
 * The `cls-hooked` is used instead of `continuation-local-storage` who doesn't work with new NodeJS API.
 *
 * @see http://fredkschott.com/post/2014/02/conquering-asynchronous-context-with-cls
 */
class CurrentUser {
  /**
   * Required to initialize `userId` after each request.
   * Must be declarated after {@link UserTokenMiddleware} who initialize `req.tokenPayload` field.
   */
  static middleware (req, res, next) {
    namespace.bindEmitter(req)
    namespace.bindEmitter(res)
    namespace.run(() => {
      let userId = (req.tokenPayload || {}).user // default: undefined
      CurrentUser.setValue(userId)
      next()
    })
  }

  static getValue () {
    return namespace.get(KEY)
  }

  /**
   * Should be used by script who doesn't use `express` middleware,
   * like command line tools, unit-tests, or `repl`.
   */
  static setValue (value) {
    return namespace.set(KEY, value)
  }

  /**
   * For testing
   * @private
   */
  static _getNamespace () {
    return namespace
  }
}

module.exports = CurrentUser
