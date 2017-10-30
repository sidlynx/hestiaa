const expect = require('expect.js')
const validate = require('../../../lib/model/validators/base64Validator').validate

describe('model/validators/base64Validator', () => {
  const MSG = 'THE ERROR MESSAGE'
  const CALLED = x => {}
  const IGNORED = x => expect().fail(x)

  it('Valid value is resolved', () => validate('dGVzdA==', MSG, CALLED, IGNORED))
  it('Empty string is resolved', () => validate('', MSG, CALLED, IGNORED))
  it('Invalid value is rejected', () => validate('???', MSG, IGNORED, CALLED))
})
