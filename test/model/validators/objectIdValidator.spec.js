const expect = require('expect.js')
const sinon = require('sinon')
const validate = require('../../../lib/model/validators/objectIdValidator').validate

describe('model/validators/obejctIdValidator', () => {
  afterEach(() => sinon.restore())

  it('Should allow a real objectid', () => {
    validate('59b28b4bf27169085c797bac', 'THE ERROR MESSAGE', () => {}, s => expect().fail(s))
  })

  it('Should not allow a bad string', () => {
    validate('I m bad', 'THE ERROR MESSAGE', s => expect().fail('ObjectId validator incorrectly returned a valid value : ' + s), s => {})
  })
})
