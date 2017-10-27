const url = require('url')
const jwt = require('jsonwebtoken')
const UrlPattern = require('url-pattern')

class UserTokenMiddleware {
  /**
   * List of all routes accessible by user without authentication.
   * URL is a pattern, because of path/query parameters.
   */
  static publicRoutes () {
    return [
      {method: 'GET', urlPattern: '/'} // Swagger specs
    ]
  }

  /**
   * Express middleware route that will check if 'Authorization' header contain
   * a valid JWT and will make it's payload available in the 'tokenPayload'
   * attribute of the req object.
   *
   * PS: This middleware may thrown a jwt.JsonWebTokenError or
   * jwt.TokenExpiredError to next() if the token verification fails.
   *
   * @example
   *   app.use(UserTokenMiddleware.handle)
   *   app.get('/', function (req, res) {
   *     req.tokenPayload // will be available
   *   })
   *
   * @param  {http.request}  req
   * @param  {http.response} res
   * @param  {Function}      next
   */
  static getHandler () {
    return (req, res, next) => {
      if (this.isRoutePublic(req)) {
        return next()
      }

      // Throws JWT error if is unable to verify
      try {
        req.tokenPayload = jwt.verify(req.headers.authorization, process.env.APP_KEY)
        next()
      } catch (err) {
        next(err)
      }
    }
  }

  /**
   * Test if the route if the given request is public
   * @param  {http.request}  req
   * @return {Boolean}
   */
  static isRoutePublic (req) {
    return this.publicRoutes().find(r => {
      return r.method === req.method &&
      new UrlPattern(r.urlPattern).match(url.parse(req.url).pathname)
    })
  }
}

module.exports = UserTokenMiddleware
