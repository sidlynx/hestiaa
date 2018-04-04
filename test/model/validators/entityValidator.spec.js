const expect = require('expect.js')
const sinon = require('sinon').sandbox.create()
const validate = require('../../../lib/model/validators/entityValidator').validate
const Entity = require('../../../lib/model/entity')

describe('model/validators/entityValidator', () => {
  let entity = new Entity()
  afterEach(() => sinon.restore())

  it('Should pass in valid entity', async () => {
    let isValidStub = sinon.stub(entity, 'isValid').resolves(true)
    let resolvedStub = sinon.stub()

    await validate(entity,
      'THE ERROR MESSAGE',
      resolvedStub,
      (s) => expect().fail(s),
      ['Entity']
    )
    expect(isValidStub.called).to.be(true)
    expect(resolvedStub.withArgs('entity is valid').called).to.be(true)
  })

  it('Should pass in valid entity without specifying type', async () => {
    let isValidStub = sinon.stub(entity, 'isValid').resolves(true)
    let resolvedStub = sinon.stub()
    await validate(entity,
      'THE ERROR MESSAGE',
      resolvedStub,
      (s) => expect().fail(s)
    )
    expect(isValidStub.called).to.be(true)
    expect(resolvedStub.withArgs('entity is valid').called).to.be(true)
  })

  it('Should reject wrong entity type', async () => {
    let rejectedStub = sinon.stub()

    await validate(entity,
      'THE ERROR MESSAGE',
      (s) => expect().fail(s),
      rejectedStub,
      ['WrongEntity']
    )
    expect(rejectedStub.withArgs('this entity type doesn\'t exists').called).to.be(true)
  })

  it('Should reject if entity is not valid', async () => {
    let rejectedStub = sinon.stub()
    sinon.stub(entity, 'isValid').rejects()

    await validate(entity,
      'THE ERROR MESSAGE',
      (s) => expect().fail(s),
      rejectedStub,
      ['Entity']
    )
    expect(rejectedStub.withArgs('THE ERROR MESSAGE').called).to.be(true)
  })
})
