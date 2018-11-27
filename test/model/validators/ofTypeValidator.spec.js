const expect = require('expect.js')
const sinon = require('sinon')
const validate = require('../../../lib/model/validators/ofTypeValidator').validate

describe('model/validators/ofTypeValidator', () => {
  afterEach(() => sinon.restore())

  it('Should allow Date', () => {
    validate(Date)(new Date(), 'THE ERROR MESSAGE', () => {}, s => expect().fail(s))
  })

  it('Should not allow String', () => {
    validate(Date)('a non duration string', 'THE ERROR MESSAGE', s => expect().fail('duration validator incorrectly returned a valid value : ' + s), s => {})
  })
})
