class ValidationError extends Error {
  constructor (messages, fileName, lineNumber) {
    let message = (messages.constructor === Array) ? messages[0] : messages
    super(message, fileName, lineNumber)

    this.name = 'ValidationError'
    this.messages = messages
    this.message = JSON.stringify(message)
  }
}

module.exports = ValidationError
