const expect = require('expect.js')
const ObjectId = require('mongorito').ObjectId
const toObjectId = require('../../../lib/model/sanitizors/toObjectIdSanitizor').toObjectId

describe('model/sanitizors/ToObjectIdSanitizor', () => {
  it('Should parse objectId strings', () => {
    let parsedObjectIdString = toObjectId('5a718d21c048f3001123d9bc')
    let parsedRealObjectId = toObjectId(ObjectId('5a718d21c048f3001123d9bc'))

    expect(parsedObjectIdString).to.be.an(ObjectId)
    expect(parsedObjectIdString.toString()).to.be('5a718d21c048f3001123d9bc')
    expect(parsedRealObjectId).to.be.an(ObjectId)
    expect(parsedRealObjectId.toString()).to.be('5a718d21c048f3001123d9bc')
  })

  it('Should not affect non objectId', () => {
    expect(toObjectId(null)).to.be(null)
    expect(toObjectId(undefined)).to.be(undefined)
    expect(toObjectId('42')).to.be('42')
    expect(toObjectId(101)).to.be(101)
    expect(toObjectId('101')).to.be('101')
  })
})
