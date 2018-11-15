const LOGGER = require('winston')

// define the custom settings for each transport (file, console)
const options = {
  console: {
    level: 'debug',
    handleExceptions: true,
    humanReadableUnhandledException: true,
    json: false,
    colorize: true,
    timestamp: true
  }
}

// instantiate a new Winston Logger with the settings defined above
const logger = new LOGGER.Logger({
  transports: [new LOGGER.transports.Console(options.console)],
  exitOnError: false // do not exit on handled exceptions
})

module.exports = logger
