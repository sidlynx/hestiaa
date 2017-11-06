const expect = require('expect.js')
const ResourceNotFoundError = require('../../lib/errors/resourceNotFoundError')

describe('errors/ResourceNotFoundError', function () {
  it('Should set message if entity type is provided', function () {
    let error = new ResourceNotFoundError('Foo')

    expect(error.message).to.be('Foo resource not found.')
  })

  it('Should be able to set specific message', function () {
    let error = new ResourceNotFoundError(null, 'Custom error message')

    expect(error.message).to.be('Custom error message')
  })
})
