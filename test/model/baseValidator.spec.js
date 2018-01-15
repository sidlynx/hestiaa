const indicative = require('indicative')
require('../../lib/model/baseValidator')

describe('model/BaseValidator', () => {
  it('Should auto-register custom validators', async () => {
    const customValidatorName = 'dateString'
    await indicative.validate({'attr': '2018-01-12'}, {'attr': customValidatorName}) // error if unknown
  })

  it('Should auto-register custom sanitizors', async () => {
    const customSanitizorName = 'toIntOptional'
    await indicative.sanitize({'attr': '42'}, {'attr': customSanitizorName}) // error if unknown
  })
})
