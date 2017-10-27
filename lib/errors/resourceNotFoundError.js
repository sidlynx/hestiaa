class ResourceNotFoundError extends Error {
  constructor (model, message) {
    super()

    this.name = 'ResourceNotFoundError'
    this.message = message || `${model} resource not found.`
  }
}

module.exports = ResourceNotFoundError
