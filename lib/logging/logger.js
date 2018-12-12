const winston = require('winston')

// define the custom settings for each transport (file, console)
const options = {
  console: {
    handleExceptions: true,
    humanReadableUnhandledException: true
  }
}

const logger = function (context) {
  const prefix = context ? `[${context}] - ` : ``

  const myFormat = winston.format.printf(info => {
    return `${info.timestamp} - ${info.level} : ${prefix}${info.message}`
  })

  // instantiate a new Winston Logger with the settings defined above
  return winston.createLogger({
    format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.prettyPrint(), myFormat),
    transports: [new winston.transports.Console(options.console)],
    exitOnError: false // do not exit on handled exceptions
  })
}

module.exports = logger
