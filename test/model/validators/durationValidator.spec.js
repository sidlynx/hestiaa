const expect = require('expect.js')
const sinon = require('sinon')
const validate = require('../../../lib/model/validators/durationValidator').validate

describe('model/validators/durationValidator', () => {
  afterEach(() => sinon.restore())

  it('Should allow P0D', () => {
    validate('P0D', 'THE ERROR MESSAGE', () => {}, s => expect().fail(s))
  })

  it('Should allow P1D', () => {
    validate('P1D', 'THE ERROR MESSAGE', () => {}, s => expect().fail(s))
  })

  // cause it's the 'required' job to make sure values are present
  it('Should NOT allow empty string', () => {
    validate('', 'THE ERROR MESSAGE', s => expect().fail('duration validator incorrectly returned a valid value : ' + s), s => {})
  })

  it('Should not allow a non duration string', () => {
    validate('a non duration string', 'THE ERROR MESSAGE', s => expect().fail('duration validator incorrectly returned a valid value : ' + s), s => {})
  })
})
