const sinon = require('sinon').sandbox.create()
const expect = require('expect.js')
const MongoritoUtils = require('../../lib/utils/mongoritoUtils')
const CurrentUser = require('../../lib/utils/currentUser')
const BaseValidator = require('../../lib/model/baseValidator')
const Entity = require('../../lib/model/entity')

class SampleValidator extends BaseValidator {
  static sanitizations () {
    return {}
  }

  static validations () {
    return {}
  }
}

class Product extends Entity {
  __getValidator () {
    return SampleValidator
  }
}

Product.use(MongoritoUtils.embeddedTraceabilityPlugin)

class Box extends Entity {
  __getValidator () {
    return SampleValidator
  }
}

Box.embeds('products', Product)
Box.use(MongoritoUtils.rootTraceabilityPlugin)

describe('utils/mongoritoUtils', () => {
  afterEach(() => sinon.restore())

  const ME = 'me'
  const OTHER = 'other'
  const NOW = new Date()
  const AFTER = new Date(NOW.getTime() + 99999999)
  let nowStub
  beforeEach('Mock Date', () => {
    nowStub = sinon.stub(MongoritoUtils, '_now').returns(NOW)
  })

  let fillFieldsSpy
  beforeEach('Spy #_fillFields', () => restoreAndSpyFillFields())

  function restoreAndSpyFillFields () {
    if (fillFieldsSpy) {
      fillFieldsSpy.restore()
    }
    fillFieldsSpy = sinon.spy(MongoritoUtils, '_fillFields')
  }

  let insertStub
  let updateStub
  beforeEach('Stub Entity#save()', () => {
    let getCollectionFake = {
      insert: () => {},
      update: () => {}
    }
    insertStub = sinon.stub(getCollectionFake, 'insert').resolves({ops: [{_id: '000000000000000000000000'}]})
    updateStub = sinon.stub(getCollectionFake, 'update').resolves({})
    sinon.stub(Box, 'getCollection').resolves(getCollectionFake)
  })

  describe('#rootTraceabilityPlugin', () => {
    it('#save() for "insert" should fill 4 fields', done => {
      CurrentUser._getNamespace().run(async () => {
        CurrentUser.setValue(ME)

        let entity = new Box({foo: 'bar'})

        await entity.save()

        // current entity
        expect(entity.get('createdAt')).to.eql(NOW)
        expect(entity.get('updatedAt')).to.eql(NOW)
        expect(entity.get('createdBy')).to.eql(ME)
        expect(entity.get('updatedBy')).to.eql(ME)
        // sent to database
        expect(insertStub.called).to.be(true)

        done()
      })
    })

    it('#save() for "update" should fill only 2 "updated" fields', done => {
      CurrentUser._getNamespace().run(async () => {
        CurrentUser.setValue(ME)

        let entity = new Box({foo: 'bar'})
        await entity.save()

        nowStub.reset()
        nowStub.returns(AFTER)
        CurrentUser.setValue(OTHER)

        entity.set('description', 'any')
        await entity.save()

        // current entity
        expect(entity.get('createdAt')).to.eql(NOW)
        expect(entity.get('updatedAt')).to.eql(AFTER)
        expect(entity.get('createdBy')).to.eql(ME)
        expect(entity.get('updatedBy')).to.eql(OTHER)
        // sent to database
        expect(updateStub.called).to.be(true)

        done()
      })
    })
  })

  describe('#embeddedTraceabilityPlugin', () => {
    it('Should call "_fillFields" on supported actions', async () => {
      let entity = new Product({foo: 'bar'})
      expect(fillFieldsSpy.called).to.be(true)
      restoreAndSpyFillFields()

      entity.set('comment', 42)
      expect(fillFieldsSpy.called).to.be(true)
      restoreAndSpyFillFields()

      entity.unset('comment')
      expect(fillFieldsSpy.called).to.be(true)
      restoreAndSpyFillFields()
    })
  })
})
