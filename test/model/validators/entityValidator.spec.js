const expect = require('expect.js')
const sinon = require('sinon').sandbox.create()
const validate = require('../../../lib/model/validators/entityValidator').validate
const Entity = require('../../../lib/model/entity')

describe('model/validators/entityValidator', () => {
  let entity = new Entity()
  afterEach(() => sinon.restore())

  it('Should pass in valid entity', async () => {
    let isValidStub = sinon.stub(entity, 'isValid')
    isValidStub.resolves(true)
    await validate(entity,
            'THE ERROR MESSAGE',
            () => {},
            (s) => expect().fail(s),
            ['Entity']
          )
    expect(isValidStub.called).to.be(true)
  })

  it('Should pass in valid entity without specifying type', async () => {
    let isValidStub = sinon.stub(entity, 'isValid')
    isValidStub.resolves(true)
    await validate(entity,
            'THE ERROR MESSAGE',
            () => {},
            (s) => expect().fail(s)
          )
    expect(isValidStub.called).to.be(true)
  })

  it('Should reject wrong entity type', async () => {
    let isValidStub = sinon.stub(entity, 'isValid')
    isValidStub.resolves(true)
    let expectedError

    try {
      await validate(entity,
              'THE ERROR MESSAGE',
              () => {},
              (s) => expect().fail(s),
              ['WrongEntity']
            )
    } catch (err) {
      expectedError = err
    }
    expect(expectedError).not.to.be(undefined)
  })

  it('Should reject if entity is not valid', async () => {
    let isValidStub = sinon.stub(entity, 'isValid')
    isValidStub.throws(new Error())
    let expectedError

    try {
      await validate(entity,
              'THE ERROR MESSAGE',
              () => {},
              (s) => expect().fail(s),
              ['WrongEntity']
            )
    } catch (err) {
      expectedError = err
    }
    expect(expectedError).not.to.be(undefined)
  })
})
