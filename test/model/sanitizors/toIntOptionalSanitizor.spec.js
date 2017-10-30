const expect = require('expect.js')
const toIntOptional = require('../../../lib/model/sanitizors/toIntOptionalSanitizor').toIntOptional

describe('model/sanitizors/toIntOptionalSanitizor', () => {
  it('Should parse value', () => {
    expect(toIntOptional(undefined, [])).to.be(undefined) // optional
    expect(toIntOptional('42', [])).to.be(42)
    expect(toIntOptional('101', [2])).to.be(5) // radix
  })
})
