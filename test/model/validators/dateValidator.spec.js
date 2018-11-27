const expect = require('expect.js')
const sinon = require('sinon')
const validate = require('../../../lib/model/validators/dateValidator').validate

describe('model/validators/dateValidator', () => {
  afterEach(() => sinon.restore())

  it('Should allow 1970-01-01', () => {
    validate('1970-01-01', 'THE ERROR MESSAGE', () => {}, s => expect().fail(s))
  })

  // cause it's the 'required' job to make sure values are present
  it('Should NOT allow empty string', () => {
    validate('', 'THE ERROR MESSAGE', s => expect().fail('date validator incorrectly returned a valid value : ' + s), s => {})
  })

  it('Should not allow a non date string', () => {
    validate('a non date string', 'THE ERROR MESSAGE', s => expect().fail('date validator incorrectly returned a valid value : ' + s), s => {})
  })
})
