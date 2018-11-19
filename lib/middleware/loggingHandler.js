const winston = require('../logging/logger')
const expressWinston = require('express-winston')
const jwt = require('jsonwebtoken')

/**
 * Utility middlewares used for ExpressJs logging.
 * Use `express-winston` for normalized implementation.
 */
class LoggingHandler {
  /** Middleware used to log request, with current user (into meta fields). */
  static getHandler () {
    return expressWinston.logger({
      winstonInstance: winston,
      dynamicMeta: (req, res) => {
        return {
          user: (jwt.decode(req.headers.authorization) || {}).user
        }
      },
      ignoreRoute: function (req, res) {
        return ['/', '/health', '/info'].includes(req.url)
      }
    })
  }

  /**
   * Log request with stack-trace.
   * Must be declared after "normal" middlewares to be processed when any error occurred.
   */
  static getErrorHandler () {
    return expressWinston.errorLogger({
      winstonInstance: winston,
      dynamicMeta: (req, res) => {
        return {
          user: (jwt.decode(req.headers.authorization) || {}).user
        }
      },
      dumpExceptions: true,
      showStack: true
    })
  }
}

module.exports = LoggingHandler
