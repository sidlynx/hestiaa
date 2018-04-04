class ForbiddenError extends Error {
  constructor (message) {
    super(message || 'Forbidden')
    this.name = ForbiddenError.name
  }
}

module.exports = ForbiddenError
